"use client";

import { useState } from "react";
import { Box, Card, Flex, Text, Icon, IconButton, Dialog } from "@chakra-ui/react";
import { Trash2, Pencil } from "lucide-react";
import { RoadmapItem, Deliverable, TaskStatus } from "./data";
import { motion, AnimatePresence } from "framer-motion";
import { DurationLabel } from "./DurationLabel";
import { DeliverablesList } from "./DeliverablesList";
import { StatusBadge } from "./StatusBadge";
import { ProgressGraph } from "./ProgressGraph";
import useCurrentUser from "@/hooks/useCurrentUser";
import { AppButton } from "@/components/AppButton";

interface TimelineItemProps {
  item: RoadmapItem;
  index: number;
  isLeft: boolean;
  onUpdateDeliverables: (id: string, deliverables: Deliverable[]) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: RoadmapItem) => void;
}

const MotionBox = motion.create(Box);

// Border color mapping based on status
const getStatusBorderColor = (status: TaskStatus): string => {
  switch (status) {
    case "Completed":
      return "green.400";
    case "Implementing":
      return "blue.400";
    case "Planning & Research":
      return "purple.400";
    case "On Hold":
      return "orange.400";
    case "Not Started":
    default:
      return "gray.300";
  }
};

export const TimelineItem = ({ item, index, isLeft, onUpdateDeliverables, onUpdateStatus, isExpanded, onToggleExpand, onDeleteItem, onEditItem }: TimelineItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  const handleDeliverablesUpdate = (deliverables: Deliverable[]) => {
    onUpdateDeliverables(item.id, deliverables);
  };

  const handleStatusChange = (status: TaskStatus) => {
    onUpdateStatus(item.id, status);
  };

  const handleDelete = () => {
    onDeleteItem(item.id);
    setIsDeleteDialogOpen(false);
  };

  const borderColor = getStatusBorderColor(item.status);
  const isLoggedIn = !!currentUser;

  return (
    <Flex
      position="relative"
      width="100%"
      mb={{ base: 3, md: 8, "2xl": 12 }}
      mt={{ base: 2, md: 2, "2xl": 4 }}
      minH={{ base: "auto", "2xl": "220px" }}
      direction={{ base: "column", md: "row" }}
      align={{ base: "flex-start", md: "center" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon Circle on the line */}
      <Box
        position="absolute"
        left={{ base: "20px", md: "50%" }}
        top="0"
        transform={{ base: "none", md: "translateX(-50%)" }}
        zIndex={10}
        bg="white"
        p={{ base: 1.5, md: 1.5, "2xl": 2 }}
        borderRadius="full"
        boxShadow="md"
        borderWidth="2px"
        borderColor="purple.400"
      >
        <Icon as={item.icon} fontSize={{ base: "lg", md: "lg", "2xl": "xl" }} color="purple.500" />
      </Box>

      {/* Content Card - positioned on left or right side */}
      <MotionBox
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        width={{ base: "calc(100% - 60px)", md: "46%", lg: "44%" }}
        ml={{ base: "60px", md: isLeft ? "0" : "auto" }}
        mr={{ base: "0", md: isLeft ? "auto" : "0" }}
        pl={isLeft ? 0 : { base: 0, md: 8 }}
        pr={isLeft ? { base: 0, md: 8 } : 0}
        position="relative"
      >
        {/* Duration Label - Computed from deliverables */}
        <DurationLabel deliverables={item.deliverables} isLeft={isLeft} />

        <Card.Root variant="elevated" boxShadow="md" borderLeftWidth={4} borderLeftColor={borderColor}>
          <Card.Body gap={{ base: 2, md: 1.5, "2xl": 2 }}>
            <Flex justify="space-between" align="center" mb={2}>
              {/* Action Buttons (Auth-gated) */}
              {isLoggedIn && (
                <Flex gap={1}>
                  <IconButton aria-label="Edit card" variant="ghost" colorPalette="blue" size="xs" onClick={() => onEditItem(item)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton aria-label="Delete card" variant="ghost" colorPalette="red" size="xs" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Flex>
              )}
              {!isLoggedIn && <Box />}
              <StatusBadge status={item.status} onStatusChange={handleStatusChange} />
            </Flex>

            <Text fontSize={{ base: "md", md: "sm", "2xl": "lg" }} fontWeight="bold" mt={1}>
              {item.title}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {item.description}
            </Text>

            <DeliverablesList deliverables={item.deliverables} onUpdate={handleDeliverablesUpdate} isExpanded={isExpanded} onToggleExpand={onToggleExpand} />
          </Card.Body>
        </Card.Root>
      </MotionBox>

      {/* Progress Graph - Positioned on OPPOSITE side of the card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            // Centering logic:
            // If isLeft (Card Left), Graph is Right. Center of Right Column is 75%.
            // If !isLeft (Card Right), Graph is Left. Center of Left Column is 25%.
            initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 20px)" }} // Slide up slightly
            animate={{ opacity: 1, x: "-50%", y: "-50%" }} // Precise Center
            exit={{ opacity: 0, x: "-50%", y: "calc(-50% + 20px)" }}
            transition={{ duration: 0.25 }}
            style={{
              position: "absolute",
              top: "50%",
              left: isLeft ? "78%" : "22%", // Perfectly centered in the opposite column axis
              // right is not needed if we rely on left for both cases
              zIndex: 15,
              display: "block",
            }}
          >
            <ProgressGraph deliverables={item.deliverables} status={item.status} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={(e) => setIsDeleteDialogOpen(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete Card</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Are you sure you want to delete <strong>{item.title}</strong>? This action cannot be undone.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap={2} justify="flex-end">
                <AppButton variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </AppButton>
                <AppButton colorPalette="red" onClick={handleDelete}>
                  Delete
                </AppButton>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Flex>
  );
};
