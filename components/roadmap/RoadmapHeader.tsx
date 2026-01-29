"use client";

import { Box, Heading, Text, Flex, IconButton, Textarea, Dialog, Stack, Spinner } from "@chakra-ui/react";
import { LuPencil } from "react-icons/lu";
import { useRoadmapHeader, useUpdateRoadmapHeader } from "@/hooks/useRoadmapHeader";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useState } from "react";
import { Form } from "@/components/Form";
import { roadmapHeaderSchema, type RoadmapHeaderInput } from "@/lib/schemas/roadmap";
import FormInputField from "@/components/FormInputField";
import FormTextarea from "@/components/FormTextarea";
import { AppButton } from "@/components/AppButton";
import { toast } from "react-toastify";

export const RoadmapHeader = () => {
  const { data: header, isLoading } = useRoadmapHeader();
  const { data: user } = useCurrentUser();
  const { mutateAsync: updateHeader, isPending } = useUpdateRoadmapHeader();
  const [isOpen, setIsOpen] = useState(false);

  const handleEditClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = async (data: RoadmapHeaderInput) => {
    try {
      await updateHeader(data);
      toast.success("Header updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update header");
    }
  };

  if (!header) return null;

  return (
    <Flex direction="column" align="center" textAlign="center" mb={{ base: 6, md: 6, "2xl": 10 }} px={4} position="relative">
      <Flex align="center" gap={2} mb={2}>
        {/* Placeholder for Logo if needed */}
      </Flex>

      <Heading size={{ base: "2xl", md: "3xl", "2xl": "3xl" }} fontWeight="black" mb={3} position="relative">
        {header.titlePrefix}{" "}
        <Text as="span" color="purple.500">
          {header.highlight}
        </Text>
        {/* Edit Button - Visible only if logged in */}
        {user && (
          <IconButton aria-label="Edit Header" size="xs" variant="ghost" colorPalette="gray" position="absolute" top={0} right={-8} onClick={handleEditClick}>
            <LuPencil />
          </IconButton>
        )}
      </Heading>

      <Text fontSize="md" color="gray.600" maxWidth="2xl">
        {header.subtitle}
      </Text>

      {/* Edit Modal (Dialog) */}
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit Header</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Form onSubmit={handleSave} schema={roadmapHeaderSchema} defaultValues={header}>
                <Stack gap={4}>
                  <FormInputField name="titlePrefix" label="Title Prefix" placeholder="Building the Future of" />
                  <FormInputField name="highlight" label="Highlight" placeholder="Engagement" />
                  <Stack gap={1}>
                    <FormTextarea name="subtitle" label="Subtitle" placeholder="Subtitle description..." />
                  </Stack>

                  <Flex justify="flex-end" gap={2} mt={4}>
                    <AppButton variant="ghost" onClick={handleClose}>
                      Cancel
                    </AppButton>
                    <AppButton type="submit" isLoading={isPending} colorPalette="blue">
                      Save
                    </AppButton>
                  </Flex>
                </Stack>
              </Form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  );
};
