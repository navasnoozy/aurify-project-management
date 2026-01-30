"use client";

import { useForm, useWatch } from "react-hook-form";
import { Dialog, Stack, Flex, Text, Input, Box } from "@chakra-ui/react";
import { AppButton } from "@/components/AppButton";
import { Deliverable } from "@/components/roadmap/types";
import { Suggestion } from "@/components/roadmap/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { Form } from "@/components/Form";

import { parseISO, format } from "date-fns";
import { addWorkingDays, getWorkingDays } from "@/lib/dateUtils";
import { useState } from "react";

// Schema for the promotion form
const promoteSchema = z.object({
  text: z.string().min(1, "Deliverable text is required"),
  // We can add start/end dates if needed, but for now let's keep it simple to Text
  // The user requirement said: "This form allows setting the deliverable's text, start date, and duration."
  startDate: z.string().optional(), // ISO date string
  duration: z.number().min(1, "Duration must be at least 1 day").default(1),
});

type PromoteFormData = z.infer<typeof promoteSchema>;

interface PromoteToDeliverableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: Suggestion | null;
  onPromote: (data: PromoteFormData) => void;
}

export const PromoteToDeliverableDialog = ({ isOpen, onClose, suggestion, onPromote }: PromoteToDeliverableDialogProps) => {
  // We can't use the generic Form component easily if we need to reset/set values dynamically based on props
  // So we'll use useForm directly or wrap it.

  // Actually, keeping it simple with react-hook-form directly might be safer for specific logic
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = useForm({
    resolver: zodResolver(promoteSchema),
    // We don't necessarily need "startDate" in defaultValues if not in schema, but useful for UI state
    defaultValues: {
      text: "",
      duration: 1,
      startDate: "",
    },
  });

  const [inputMode, setInputMode] = useState<"duration" | "endDate">("duration");
  const [endDate, setEndDate] = useState("");

  const watchedStartDate = useWatch({ control: control, name: "startDate" });
  const watchedDuration = useWatch({ control: control, name: "duration" });

  // Update End Date when Start Date or Duration changes (if in Duration mode)
  useEffect(() => {
    if (inputMode === "duration" && watchedStartDate && watchedDuration) {
      try {
        const start = parseISO(watchedStartDate);
        // Using existing utility to calculate end date based on working days
        const end = addWorkingDays(start, watchedDuration);
        setEndDate(format(end, "yyyy-MM-dd"));
      } catch (e) {
        // invalid date
      }
    }
  }, [watchedStartDate, watchedDuration, inputMode]);

  // Update Duration when End Date changes (if in End Date mode)
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    if (inputMode === "endDate" && watchedStartDate && newEndDate) {
      try {
        // Calculate days between start and end
        // Simple difference first, or working days?
        // Let's use differenceInDays for raw duration, or strict working days?
        // User asked for "duration days", usually implies working days in this context?
        // Let's stick to simple logic: Duration = Working Days between Start and End
        // We need a utility in dateUtils for this inverse calculation if we want to be precise.
        // For now, let's just use differenceInCalendarDays as a rough estimate or implement a simple loop.
        // Actually, getWorkingDays (which works well) is better.
        // But getWorkingDays in dateUtils seems to be "workingDays++" loop.
        const days = getWorkingDays(watchedStartDate, newEndDate);
        setValue("duration", days > 0 ? days : 1);
      } catch (e) {
        setValue("duration", 1);
      }
    }
  };

  const handleModeChange = (val: string) => {
    setInputMode(val as "duration" | "endDate");
  };

  useEffect(() => {
    if (isOpen && suggestion) {
      setValue("text", suggestion.content);
      setValue("duration", 1);
      // Set default start date to today?
      setValue("startDate", new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, suggestion, setValue]);

  const onSubmit = (data: PromoteFormData) => {
    onPromote(data);
    onClose();
  };

  if (!suggestion) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <Dialog.Positioner justifyContent="center" alignItems="center">
        <Dialog.Content bg="white" p={6} borderRadius="xl" boxShadow="2xl" maxW="md" w="100%">
          <Dialog.Header mb={4}>
            <Dialog.Title fontSize="lg" fontWeight="bold">
              Promote to Deliverable
            </Dialog.Title>
            <Text fontSize="sm" color="gray.500">
              Transform this suggestion into a formal deliverable on the roadmap.
            </Text>
          </Dialog.Header>

          <Dialog.Body>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>
                    Deliverable Text
                  </Text>
                  <Input {...register("text")} placeholder="Enter deliverable description" />
                  {errors.text && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {errors.text.message}
                    </Text>
                  )}
                </Box>

                <Flex gap={4}>
                  <Box flex={1}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Start Date
                    </Text>
                    <Input type="date" {...register("startDate")} />
                  </Box>

                  <Box flex={1}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {inputMode === "duration" ? "Duration (Days)" : "End Date"}
                      </Text>
                      <Text fontSize="xs" color="blue.500" cursor="pointer" textDecoration="underline" onClick={() => handleModeChange(inputMode === "duration" ? "endDate" : "duration")}>
                        {inputMode === "duration" ? "Set End Date" : "Set Duration"}
                      </Text>
                    </Flex>

                    {inputMode === "duration" ? (
                      <Input type="number" {...register("duration", { valueAsNumber: true })} min={1} />
                    ) : (
                      <Input type="date" value={endDate} onChange={handleEndDateChange} min={watchedStartDate} />
                    )}

                    {errors.duration && (
                      <Text fontSize="xs" color="red.500" mt={1}>
                        {errors.duration.message}
                      </Text>
                    )}
                  </Box>
                </Flex>

                <Flex justify="flex-end" gap={3} mt={6}>
                  <AppButton variant="ghost" onClick={onClose}>
                    Cancel
                  </AppButton>
                  <AppButton type="submit" colorPalette="green" isLoading={isSubmitting}>
                    Promote & Create
                  </AppButton>
                </Flex>
              </Stack>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

// End of component
