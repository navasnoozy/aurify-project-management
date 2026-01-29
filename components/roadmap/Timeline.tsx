"use client";

import { useState } from "react";
import { Box, Flex, Spinner, Center, Text } from "@chakra-ui/react";
import { TimelineItem } from "./TimelineItem";
import { AddCardPlaceholder } from "./AddCardPlaceholder";
import { CardModal } from "./CardModal";
import { RoadmapItem, Deliverable, TaskStatus } from "./data";
import { useRoadmapItems, useCreateRoadmapItem, useUpdateRoadmapItem, useDeleteRoadmapItem, useReorderRoadmapItems } from "@/hooks/useRoadmap";
import { AddCardInput } from "@/lib/schemas/roadmap";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay, DragStartEvent, DragEndEvent, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { SortableTimelineItem } from "./SortableTimelineItem";
import { TimelineItemPreview } from "./TimelineItemPreview";
import { motion } from "motion/react";

interface ModalState {
  isOpen: boolean;
  mode: "add" | "edit";
  data?: RoadmapItem;
}

export const Timeline = () => {
  // Server State via React Query
  const { data: items = [], isLoading, isError } = useRoadmapItems();
  const createItemMutation = useCreateRoadmapItem();
  const updateItemMutation = useUpdateRoadmapItem();
  const deleteItemMutation = useDeleteRoadmapItem();
  const reorderMutation = useReorderRoadmapItems();

  // Local state for UI Only
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Unified Modal State
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add",
  });

  // Sensors with robust constraints
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 10 } }), useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }));

  const activeItem = items.find((i) => i.id === activeDragId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Optimistic update + backend sync
        reorderMutation.mutate(newOrder.map((i) => i.id));
      }
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleUpdateDeliverables = (id: string, deliverables: Deliverable[]) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      updateItemMutation.mutate({ ...item, deliverables });
    }
  };

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      updateItemMutation.mutate({ ...item, status });
    }
  };

  const handleSaveItem = (item: RoadmapItem) => {
    if (modalState.mode === "add") {
      const input: AddCardInput = {
        title: item.title,
        description: item.description,
        status: item.status,
        iconName: item.iconName as AddCardInput["iconName"],
      };
      createItemMutation.mutate(input);
    } else {
      updateItemMutation.mutate(item);
    }
    closeModal();
  };

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  const openAddModal = () => {
    setModalState({ isOpen: true, mode: "add" });
  };

  const openEditModal = (item: RoadmapItem) => {
    setModalState({ isOpen: true, mode: "edit", data: item });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  if (isLoading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center py={20}>
        <Text color="red.500">Failed to load roadmap data. Please try again.</Text>
      </Center>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box position="relative" width="full" maxWidth={{ base: "full", md: "5xl", lg: "6xl" }} mx="auto" p={4} pb={8}>
        <Flex direction="column">
          {/* Active Items Section - Solid Line */}
          <Box position="relative">
            {/* Solid Gradient Line */}
            <Box
              position="absolute"
              left={{ base: "39px", md: "50%" }}
              top="0"
              bottom="0"
              width="3px"
              bgGradient="to-b"
              gradientFrom="blue.500"
              gradientVia="purple.500"
              gradientTo="green.500"
              transform={{ base: "none", md: "translateX(-50%)" }}
              zIndex={0}
              borderBottomRadius="full"
              boxShadow="0 0 12px rgba(139, 92, 246, 0.4)"
            />

            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              {items.map((item, index) => (
                <SortableTimelineItem
                  key={item.id}
                  item={item}
                  index={index}
                  onUpdateDeliverables={handleUpdateDeliverables}
                  onUpdateStatus={handleUpdateStatus}
                  isExpanded={expandedId === item.id}
                  onToggleExpand={() => handleToggleExpand(item.id)}
                  onDeleteItem={handleDeleteItem}
                  onEditItem={openEditModal}
                />
              ))}
            </SortableContext>
          </Box>

          {/* Future/Placeholder Section - Dashed Line Logic */}
          <Box position="relative">
            {/* Dashed Connector Line */}
            <Box
              position="absolute"
              left={{ base: "39px", md: "50%" }}
              top="0"
              bottom="50%"
              width="2px"
              borderLeftWidth="2px"
              borderLeftStyle="dashed"
              borderColor="gray.300"
              transform={{ base: "none", md: "translateX(-50%)" }}
              zIndex={0}
            />

            <AddCardPlaceholder onClick={openAddModal} isLeft={items.length % 2 === 0} />
          </Box>
        </Flex>

        <CardModal isOpen={modalState.isOpen} onClose={closeModal} onSave={handleSaveItem} initialData={modalState.mode === "edit" ? modalState.data : null} />

        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 0.85, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              style={{ width: "100%", transformOrigin: "center center" }}
            >
              <TimelineItemPreview item={activeItem} />
            </motion.div>
          ) : null}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};
