"use client";

import { Box, Text, Popover, Input, Flex, IconButton, Stack } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import { Calendar, Check, X } from "lucide-react";
import { Deliverable, isDateRangeOccupied } from "./data";

interface DeliverableDurationProps {
  deliverable: Deliverable;
  allDeliverables: Deliverable[];
  onUpdate: (startDate: string, durationDays: number) => void;
}

export const DeliverableDuration = ({ deliverable, allDeliverables, onUpdate }: DeliverableDurationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editStartDate, setEditStartDate] = useState(deliverable.startDate);
  const [editDurationDays, setEditDurationDays] = useState(deliverable.durationDays);
  const [editMode, setEditMode] = useState<"duration" | "endDate">("duration");
  const [editEndDate, setEditEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const endDate = addDays(parseISO(deliverable.startDate), deliverable.durationDays);

  const formatDateShort = (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "MMM d");
  };

  useEffect(() => {
    if (isOpen) {
      const calculatedEnd = addDays(parseISO(editStartDate), editDurationDays);
      setEditEndDate(format(calculatedEnd, "yyyy-MM-dd"));
      setError(null);
    }
  }, [isOpen, editStartDate, editDurationDays]);

  const validateAndUpdate = (startDate: string, durationDays: number) => {
    if (isDateRangeOccupied(allDeliverables, startDate, durationDays, deliverable.id)) {
      setError("Overlaps with another deliverable");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDurationChange = (value: string) => {
    const days = parseInt(value) || 1;
    setEditDurationDays(days);
    const newEnd = addDays(parseISO(editStartDate), days);
    setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    validateAndUpdate(editStartDate, days);
  };

  const handleEndDateChange = (value: string) => {
    setEditEndDate(value);
    if (value && editStartDate) {
      const diff = differenceInDays(parseISO(value), parseISO(editStartDate));
      if (diff > 0) {
        setEditDurationDays(diff);
        validateAndUpdate(editStartDate, diff);
      }
    }
  };

  const handleStartDateChange = (value: string) => {
    setEditStartDate(value);
    const newEnd = addDays(parseISO(value), editDurationDays);
    setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    validateAndUpdate(value, editDurationDays);
  };

  const handleSave = () => {
    if (validateAndUpdate(editStartDate, editDurationDays)) {
      onUpdate(editStartDate, editDurationDays);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setEditStartDate(deliverable.startDate);
    setEditDurationDays(deliverable.durationDays);
    setError(null);
    setIsOpen(false);
  };

  // Compact display
  const displayText = `${formatDateShort(deliverable.startDate)} - ${formatDateShort(endDate)} (${deliverable.durationDays}d)`;

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
      <Popover.Positioner>
        <Popover.Content width="240px">
          <Popover.Arrow>
            <Popover.ArrowTip />
          </Popover.Arrow>
          <Popover.Body p={2}>
            <Stack gap={2}>
              <Text fontWeight="bold" fontSize="xs">
                Edit Duration
              </Text>

              {error && (
                <Text fontSize="2xs" color="red.500" bg="red.50" p={1} borderRadius="sm">
                  {error}
                </Text>
              )}

              <Box>
                <Text fontSize="2xs" color="gray.600" mb={0.5}>
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
                  <Text fontSize="2xs" color="gray.500" mt={0.5}>
                    End: {editEndDate ? format(parseISO(editEndDate), "MMM d, yyyy") : "-"}
                  </Text>
                </Box>
              ) : (
                <Box>
                  <Input type="date" size="xs" value={editEndDate} onChange={(e) => handleEndDateChange(e.target.value)} min={editStartDate} />
                  <Text fontSize="2xs" color="gray.500" mt={0.5}>
                    Duration: {editDurationDays} days
                  </Text>
                </Box>
              )}

              <Flex justify="flex-end" gap={1}>
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
    </Popover.Root>
  );
};
