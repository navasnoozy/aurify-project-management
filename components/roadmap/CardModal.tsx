"use client";

import { Dialog, Stack, Flex } from "@chakra-ui/react";
import { Form } from "@/components/Form";
import FormInputField from "@/components/FormInputField";
import FormTextarea from "@/components/FormTextarea";
import FormRadioGroup from "@/components/FormRadioGroup";
import { AppButton } from "@/components/AppButton";
import { addCardSchema, type AddCardInput } from "@/lib/schemas/roadmap";
import { RoadmapItem, TaskStatus, TASK_STATUSES } from "./data";
import { LuRocket } from "react-icons/lu";
import { FormIconPicker } from "./FormIconPicker";
import { DEFAULT_ICON_NAME, IconName } from "./iconConfig";

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: RoadmapItem) => void;
  initialData?: RoadmapItem | null;
}

export const CardModal = ({ isOpen, onClose, onSave, initialData }: CardModalProps) => {
  const isEditMode = !!initialData;
  const title = isEditMode ? "Edit Roadmap Card" : "Add New Roadmap Card";
  const confirmText = isEditMode ? "Save Changes" : "Add Card";

  // Default values based on mode
  const defaultValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: (initialData?.status as TaskStatus) || "Not Started",
    iconName: (initialData?.iconName as IconName) || DEFAULT_ICON_NAME,
  };

  const handleSubmit = (data: AddCardInput) => {
    if (isEditMode && initialData) {
      // Edit Mode
      const updatedItem: RoadmapItem = {
        ...initialData,
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus,
        iconName: data.iconName, // Pass iconName
      };
      onSave(updatedItem);
    } else {
      // Add Mode
      const newItem: RoadmapItem = {
        id: `card-${Date.now()}`,
        title: data.title,
        description: data.description,
        status: data.status as TaskStatus,
        iconName: data.iconName, // Pass iconName
        deliverables: [],
        // icon: handled by hook transform
      } as any;
      onSave(newItem);
    }
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="500px">
          <Dialog.Header>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {/* 
              Force re-mount Form when initialData changes or isOpen toggles 
              to ensure defaultValues are reset correctly.
            */}
            <Form key={initialData?.id || "new"} onSubmit={handleSubmit} schema={addCardSchema} defaultValues={defaultValues} mode="onSubmit">
              <Stack gap={4}>
                <FormInputField name="title" label="Title" placeholder="e.g., Feature Development" />
                <FormTextarea name="description" label="Description" placeholder="Describe this milestone..." />

                <FormIconPicker name="iconName" />

                <FormRadioGroup name="status" label="Status" options={TASK_STATUSES} />

                <Flex justify="flex-end" gap={2} mt={4}>
                  <AppButton variant="ghost" onClick={onClose}>
                    Cancel
                  </AppButton>
                  <AppButton type="submit" colorPalette="purple">
                    {confirmText}
                  </AppButton>
                </Flex>
              </Stack>
            </Form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
