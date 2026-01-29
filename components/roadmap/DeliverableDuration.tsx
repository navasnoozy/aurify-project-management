"use client";

import { Box, Text, Popover, Input, Flex, IconButton, Stack, Portal } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Calendar, Check, X } from "lucide-react";
import { Deliverable, isDateRangeOccupied } from "./data";
import { addWorkingDays, getWorkingDays } from "@/lib/dateUtils";
import { Switch } from "../ui/switch";

interface DeliverableDurationProps {
  deliverable: Deliverable;
  allDeliverables: Deliverable[];
  onUpdate: (startDate: string, durationDays: number, options: { excludeHolidays: boolean; excludeSaturdays: boolean }) => void;
  isEditable?: boolean;
}

export const DeliverableDuration = ({ deliverable, allDeliverables, onUpdate, isEditable = false }: DeliverableDurationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editStartDate, setEditStartDate] = useState(deliverable.startDate);
  const [editDurationDays, setEditDurationDays] = useState(deliverable.durationDays);
  const [excludeHolidays, setExcludeHolidays] = useState(deliverable.excludeHolidays ?? true);
  const [excludeSaturdays, setExcludeSaturdays] = useState(deliverable.excludeSaturdays ?? false);

  const [editMode, setEditMode] = useState<"duration" | "endDate">("duration");
  const [editEndDate, setEditEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const endDate = addWorkingDays(deliverable.startDate, deliverable.durationDays, {
    excludeHolidays: deliverable.excludeHolidays ?? true,
    excludeSaturdays: deliverable.excludeSaturdays ?? false,
  });

  const formatDateShort = (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "MMM d");
  };

  useEffect(() => {
    if (isOpen) {
      const calculatedEnd = addWorkingDays(editStartDate, editDurationDays, { excludeHolidays, excludeSaturdays });
      setEditEndDate(format(calculatedEnd, "yyyy-MM-dd"));
      setError(null);
    }
  }, [isOpen, editStartDate, editDurationDays, excludeHolidays, excludeSaturdays]);

  const validateAndUpdate = (startDate: string, durationDays: number, currentOptions: { excludeHolidays: boolean; excludeSaturdays: boolean }) => {
    if (isDateRangeOccupied(allDeliverables, startDate, durationDays, deliverable.id, currentOptions)) {
      setError("Overlaps with another deliverable");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDurationChange = (value: string) => {
    const days = parseInt(value) || 1;
    setEditDurationDays(days);
    const newEnd = addWorkingDays(editStartDate, days, { excludeHolidays, excludeSaturdays });
    setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    validateAndUpdate(editStartDate, days, { excludeHolidays, excludeSaturdays });
  };

  const handleEndDateChange = (value: string) => {
    setEditEndDate(value);
    if (value && editStartDate) {
      // Calculate working days between start and selected end date
      const days = getWorkingDays(editStartDate, value, { excludeHolidays, excludeSaturdays });
      if (days > 0) {
        setEditDurationDays(days);
        validateAndUpdate(editStartDate, days, { excludeHolidays, excludeSaturdays });
      }
    }
  };

  const handleStartDateChange = (value: string) => {
    setEditStartDate(value);
    const newEnd = addWorkingDays(value, editDurationDays, { excludeHolidays, excludeSaturdays });
    setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    validateAndUpdate(value, editDurationDays, { excludeHolidays, excludeSaturdays });
  };

  const handleOptionChange = (key: "holidays" | "saturdays", checked: boolean) => {
    const newHolidays = key === "holidays" ? checked : excludeHolidays;
    const newSaturdays = key === "saturdays" ? checked : excludeSaturdays;

    if (key === "holidays") setExcludeHolidays(checked);
    if (key === "saturdays") setExcludeSaturdays(checked);

    // Recalculate based on current mode
    if (editMode === "duration") {
      // Keep duration constant, update end date
      const newEnd = addWorkingDays(editStartDate, editDurationDays, { excludeHolidays: newHolidays, excludeSaturdays: newSaturdays });
      setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    } else {
      // Keep end date constant (if possible), update duration?
      // Better to follow duration priority usually, but if user is changing rules, duration usually stays same (work effort same), dates shift.
      // So same logic as duration change.
      const newEnd = addWorkingDays(editStartDate, editDurationDays, { excludeHolidays: newHolidays, excludeSaturdays: newSaturdays });
      setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    }
    validateAndUpdate(editStartDate, editDurationDays, { excludeHolidays: newHolidays, excludeSaturdays: newSaturdays });
  };

  const handleSave = () => {
    const options = { excludeHolidays, excludeSaturdays };
    if (validateAndUpdate(editStartDate, editDurationDays, options)) {
      onUpdate(editStartDate, editDurationDays, options);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setEditStartDate(deliverable.startDate);
    setEditDurationDays(deliverable.durationDays);
    setExcludeHolidays(deliverable.excludeHolidays ?? true);
    setExcludeSaturdays(deliverable.excludeSaturdays ?? false);
    setError(null);
    setIsOpen(false);
  };

  // Compact display
  const displayText = `${formatDateShort(deliverable.startDate)} - ${formatDateShort(endDate)} (${deliverable.durationDays}d)`;

  if (!isEditable) {
    return (
      <Flex align="center" gap={1} px={1.5} py={0.5} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
        <Calendar size={10} color="var(--chakra-colors-blue-500)" />
        <Text fontSize="2xs" color="blue.700" whiteSpace="nowrap">
          {displayText}
        </Text>
      </Flex>
    );
  }

  return (
    <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
      <Popover.Trigger asChild>
        <Flex align="center" gap={1} px={1.5} py={0.5} bg="blue.50" borderRadius="md" cursor="pointer" borderWidth="1px" borderColor="blue.200" _hover={{ bg: "blue.100" }} transition="all 0.2s">
          <Calendar size={10} color="var(--chakra-colors-blue-500)" />
          <Text fontSize="2xs" color="blue.700" whiteSpace="nowrap">
            {displayText}
          </Text>
        </Flex>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner zIndex="popover">
          <Popover.Content width="260px">
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Body p={3}>
              <Stack gap={3}>
                <Text fontWeight="bold" fontSize="xs">
                  Edit Duration
                </Text>

                {error && (
                  <Text fontSize="2xs" color="red.500" bg="red.50" p={1} borderRadius="sm">
                    {error}
                  </Text>
                )}

                <Box>
                  <Text fontSize="2xs" color="gray.600" mb={1}>
                    Start Date
                  </Text>
                  <Input type="date" size="xs" value={editStartDate} onChange={(e) => handleStartDateChange(e.target.value)} />
                </Box>

                <Flex gap={2} fontSize="2xs">
                  <Text fontWeight={editMode === "duration" ? "bold" : "normal"} color={editMode === "duration" ? "blue.600" : "gray.500"} cursor="pointer" onClick={() => setEditMode("duration")}>
                    Duration
                  </Text>
                  <Text color="gray.400">|</Text>
                  <Text fontWeight={editMode === "endDate" ? "bold" : "normal"} color={editMode === "endDate" ? "blue.600" : "gray.500"} cursor="pointer" onClick={() => setEditMode("endDate")}>
                    End Date
                  </Text>
                </Flex>

                {editMode === "duration" ? (
                  <Box>
                    <Input type="number" size="xs" min={1} value={editDurationDays} onChange={(e) => handleDurationChange(e.target.value)} />
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      End: {editEndDate ? format(parseISO(editEndDate), "MMM d, yyyy") : "-"}
                    </Text>
                  </Box>
                ) : (
                  <Box>
                    <Input type="date" size="xs" value={editEndDate} onChange={(e) => handleEndDateChange(e.target.value)} min={editStartDate} />
                    <Text fontSize="2xs" color="gray.500" mt={1}>
                      Duration: {editDurationDays} working days
                    </Text>
                  </Box>
                )}

                <Stack gap={2} mt={1}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="2xs" color="gray.600">
                      Exclude Holidays
                    </Text>
                    <Switch size="xs" checked={excludeHolidays} onCheckedChange={(e: { checked: boolean }) => handleOptionChange("holidays", e.checked)} />
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="2xs" color="gray.600">
                      Exclude Saturdays
                    </Text>
                    <Switch size="xs" checked={excludeSaturdays} onCheckedChange={(e: { checked: boolean }) => handleOptionChange("saturdays", e.checked)} />
                  </Flex>
                </Stack>

                <Flex justify="flex-end" gap={1} mt={2}>
                  <IconButton aria-label="Cancel" size="xs" variant="ghost" onClick={handleCancel}>
                    <X size={12} />
                  </IconButton>
                  <IconButton aria-label="Save" size="xs" colorPalette="green" onClick={handleSave} disabled={!!error}>
                    <Check size={12} />
                  </IconButton>
                </Flex>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};
