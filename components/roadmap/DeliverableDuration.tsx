"use client";

import { Box, Text, Popover, Input, Flex, IconButton, Stack, Portal } from "@chakra-ui/react";

import { useState, useEffect } from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar, Check, X } from "lucide-react";
import { Deliverable, isDateRangeOccupied } from "./types";
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
  const [allowOverlap, setAllowOverlap] = useState(false);

  // Calculate Inclusive End Date for Display (Duration - 1 working day)
  // If duration is 1, end date is same as start date (conceptually)
  const displayEndDate = addWorkingDays(deliverable.startDate, Math.max(0, deliverable.durationDays - 1), {
    excludeHolidays: deliverable.excludeHolidays ?? true,
    excludeSaturdays: deliverable.excludeSaturdays ?? false,
  });

  const formatDateShort = (date: Date | string) => {
    const d = typeof date === "string" ? parseISO(date) : date;
    return isValid(d) ? format(d, "MMM d") : "-";
  };

  useEffect(() => {
    if (isOpen) {
      // Calculate Inclusive End for Edit Mode
      const calculatedEnd = addWorkingDays(editStartDate, Math.max(0, editDurationDays - 1), { excludeHolidays, excludeSaturdays });
      if (isValid(calculatedEnd)) {
        setEditEndDate(format(calculatedEnd, "yyyy-MM-dd"));
      }
      setError(null);
    }
  }, [isOpen, editStartDate, editDurationDays, excludeHolidays, excludeSaturdays]);

  const validateAndUpdate = (startDate: string, durationDays: number, currentOptions: { excludeHolidays: boolean; excludeSaturdays: boolean }, skipOverlapCheck = false) => {
    if (!skipOverlapCheck && isDateRangeOccupied(allDeliverables, startDate, durationDays, deliverable.id, currentOptions)) {
      setError("Overlaps with another deliverable");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDurationChange = (value: string) => {
    const days = parseInt(value) || 1;
    setEditDurationDays(days);
    const newEnd = addWorkingDays(editStartDate, Math.max(0, days - 1), { excludeHolidays, excludeSaturdays });
    if (isValid(newEnd)) {
      setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    }
    validateAndUpdate(editStartDate, days, { excludeHolidays, excludeSaturdays }, allowOverlap);
  };

  const handleEndDateChange = (value: string) => {
    setEditEndDate(value);
    if (value && editStartDate) {
      // Logic: Count working days between editStartDate and value (Inclusive)
      // Since we don't have a direct 'getInclusiveWorkingDays', we can approximate or use loop
      // But cleaner is to rely on user input. For now, let's implement a simple loop count here or import working days util and add +1 logic?
      // getWorkingDays returns distance.
      // E.g. Start 13, End 13. getWorkingDays(13, 13) -> 0. Duration should be 1.
      // So Duration = getWorkingDays + 1?
      // Check if start/end are valid working days?
      // For simplicity in this logic: Expected Duration = getWorkingDays(Start, End + 1 day) ?
      // Let's rely on getWorkingDays logic which iterates.
      // getWorkingDays(Start, End) calculates days in (Start, End].
      // So if we want [Start, End], we need to know if Start is working day.
      // Actually, standard getWorkingDays usually excludes start.
      // Let's use robust calculation:
      // duration = getWorkingDays(start, addDays(end, 1))?
      // No, let's just use existing utility and adjust.
      // If we pass 'value' (inclusive end), getWorkingDays(start, value) is missing the start day count (if working)
      // No, getWorkingDays iterates from start+1.
      // So result is correct count of days AFTER start.
      // So Total Duration = (Is Start Working? 1 : 0) + getWorkingDays(start, value).

      // Let's simplify: duration matches the addWorkingDays logic.
      // addWorkingDays(start, d-1) = end.
      // We want inverse.
      // Let's brute force count for safety (UI interaction is rare compared to utility usage):
      let count = 0;
      let curr = parseISO(editStartDate);
      const target = parseISO(value);

      // Safety brake
      if (target < curr) {
        setEditDurationDays(0);
        return;
      }

      // Check current (Start)
      // This duplicates logic but ensures WYSIWYG
      // We need to count working days in range [start, end]
      // We can iterate day by day.
      // Max loop 365 (1 year) safe.

      // Better: reuse getWorkingDays but add start day check.
      // Actually, getWorkingDays(start, end) counts days in (start, end].
      // So we just need to check if Start is working day.

      const dist = getWorkingDays(editStartDate, value, { excludeHolidays, excludeSaturdays });

      // Check if start date itself is working day
      // But wait, if start date is Sunday/Holiday, it shouldn't be a start date ideally?
      // The system allows it but duration logic skips it.
      // If Start is non-working, Duration starts counting from next working day?
      // No, addWorkingDays(start, 1) returns start if start is non-working?
      // No, existing addWorkingDays logic: Start is the anchor. It moves +1 day then checks.
      // So if Start is Sunday.
      // addWorkingDays(Sun, 1).
      // Loop 1: Mon. Working? Yes. Count=1.
      // Result Mon.
      // So Duration 1 starting Sun ends Mon.
      // So Start day status doesn't matter for `addWorkingDays`.

      // So for inverse:
      // getWorkingDays(Sun, Mon) -> 1.
      // Duration 1 matches.
      // So `getWorkingDays(start, end)` IS the duration!
      // Wait.
      // addWorkingDays(Start, 0) = Start.
      // getWorkingDays(Start, Start) = 0.
      // If user picks End = Start. They want Duration 1 (usually).
      // But logically Duration 0 means nothing done.
      // If UI implicitly means "End of day", Duration 1.
      // If UI means "Inclusive Day", selecting Start=End means 1 day work.

      // If I use `addWorkingDays(start, duration-1)` for display.
      // Duration 1 -> addWorkingDays(start, 0) -> Start.
      // So End = Start.
      // User selects End = Start.
      // getWorkingDays(Start, Start) = 0.
      // We want 1.
      // So Duration = getWorkingDays + 1 ??

      // Let's test Duration 2.
      // addWorkingDays(13, 1) -> 14.
      // End = 14.
      // getWorkingDays(13, 14) -> 1.
      // We want 2.
      // So yes, Duration = getWorkingDays + 1.

      const days = getWorkingDays(editStartDate, value, { excludeHolidays, excludeSaturdays }) + 1;

      if (days > 0) {
        setEditDurationDays(days);
        validateAndUpdate(editStartDate, days, { excludeHolidays, excludeSaturdays }, allowOverlap);
      }
    }
  };

  const handleStartDateChange = (value: string) => {
    setEditStartDate(value);
    const newEnd = addWorkingDays(value, Math.max(0, editDurationDays - 1), { excludeHolidays, excludeSaturdays });
    if (isValid(newEnd)) {
      setEditEndDate(format(newEnd, "yyyy-MM-dd"));
    }
    validateAndUpdate(value, editDurationDays, { excludeHolidays, excludeSaturdays }, allowOverlap);
  };

  const handleOptionChange = (key: "holidays" | "saturdays", checked: boolean) => {
    const newHolidays = key === "holidays" ? checked : excludeHolidays;
    const newSaturdays = key === "saturdays" ? checked : excludeSaturdays;

    if (key === "holidays") setExcludeHolidays(checked);
    if (key === "saturdays") setExcludeSaturdays(checked);

    // Recalculate based on current mode
    if (editMode === "duration") {
      // Keep duration constant, update end date
      const newEnd = addWorkingDays(editStartDate, Math.max(0, editDurationDays - 1), { excludeHolidays: newHolidays, excludeSaturdays: newSaturdays });
      if (isValid(newEnd)) {
        setEditEndDate(format(newEnd, "yyyy-MM-dd"));
      }
    } else {
      // Keep end date constant (if possible), update duration?
      // Better to follow duration priority usually, but if user is changing rules, duration usually stays same (work effort same), dates shift.
      // So same logic as duration change.
      const newEnd = addWorkingDays(editStartDate, Math.max(0, editDurationDays - 1), { excludeHolidays: newHolidays, excludeSaturdays: newSaturdays });
      if (isValid(newEnd)) {
        setEditEndDate(format(newEnd, "yyyy-MM-dd"));
      }
    }
    validateAndUpdate(editStartDate, editDurationDays, { excludeHolidays: newHolidays, excludeSaturdays: newSaturdays }, allowOverlap);
  };

  const handleSave = () => {
    const options = { excludeHolidays, excludeSaturdays };
    if (validateAndUpdate(editStartDate, editDurationDays, options, allowOverlap)) {
      onUpdate(editStartDate, editDurationDays, options);
      setIsOpen(false);
      setAllowOverlap(false); // Reset on save
    }
  };

  const handleCancel = () => {
    setEditStartDate(deliverable.startDate);
    setEditDurationDays(deliverable.durationDays);
    setExcludeHolidays(deliverable.excludeHolidays ?? true);
    setExcludeSaturdays(deliverable.excludeSaturdays ?? false);
    setError(null);
    setAllowOverlap(false); // Reset on cancel
    setIsOpen(false);
  };

  // Compact display (Inclusive End Date)
  const displayText = `${formatDateShort(deliverable.startDate)} - ${formatDateShort(displayEndDate)} (${deliverable.durationDays}d)`;

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
    <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} autoFocus={false}>
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
                  <Flex align="center" justify="space-between" bg="red.50" p={2} borderRadius="md" borderWidth="1px" borderColor="red.200">
                    <Text fontSize="xs" color="red.600" fontWeight="medium">
                      {error}
                    </Text>
                    {error.includes("Overlaps") && (
                      <Flex align="center" gap={1.5}>
                        <Text fontSize="xs" color="red.600">
                          Allow?
                        </Text>
                        <Switch size="xs" colorPalette="red" checked={allowOverlap} onCheckedChange={(e: { checked: boolean }) => setAllowOverlap(e.checked)} />
                      </Flex>
                    )}
                  </Flex>
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
                      End: {editEndDate && isValid(parseISO(editEndDate)) ? format(parseISO(editEndDate), "MMM d, yyyy") : "-"}
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
                  <IconButton aria-label="Save" size="xs" colorPalette="green" onClick={handleSave} disabled={!!error && !allowOverlap}>
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
