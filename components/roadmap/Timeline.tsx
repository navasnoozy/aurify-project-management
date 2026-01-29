"use client";

import { useState } from "react";
import { Box, Flex, Spinner, Center, Text } from "@chakra-ui/react";
import { TimelineItem } from "./TimelineItem";
import { AddCardPlaceholder } from "./AddCardPlaceholder";
import { CardModal } from "./CardModal";
import { RoadmapItem, Deliverable, TaskStatus } from "./data";
import { useRoadmapItems, useCreateRoadmapItem, useUpdateRoadmapItem, useDeleteRoadmapItem } from "@/hooks/useRoadmap";
import { AddCardInput } from "@/lib/schemas/roadmap";

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

  // Local state for UI Only
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Unified Modal State
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add",
  });

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleUpdateDeliverables = (id: string, deliverables: Deliverable[]) => {
    // Ideally this would be a mutation too, but our current API only updates full item
    // We can find the item and update it
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

  // Add or Update Handler
  const handleSaveItem = (item: RoadmapItem) => {
    if (modalState.mode === "add") {
      // For create, we filter out ID since backend generates it,
      // OR we adjust our create mutation to accept AddCardInput.
      // Our CardModal sends a full RoadmapItem with a temp ID.
      // We should strip it and send only the necessary fields to CREATE endpoint.
      // The API expects { title, description, status }.
      const input: AddCardInput = {
        title: item.title,
        description: item.description,
        status: item.status,
        iconName: item.iconName as AddCardInput["iconName"],
      };
      createItemMutation.mutate(input);
    } else {
      // Edit Mode
      updateItemMutation.mutate(item);
    }
    closeModal();
  };

  // Delete card
  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  // Modal Handlers
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
    <Box position="relative" width="full" maxWidth={{ base: "full", md: "5xl", lg: "6xl" }} mx="auto" p={4} pb={8}>
      <Flex direction="column">
        {/* Active Items Section - Solid Line */}
        <Box position="relative">
          {/* Solid Gradient Line */}
          <Box
            position="absolute"
            left={{ base: "39px", md: "50%" }}
            top="0"
            bottom="0" // Spans full height of this container
            width="3px"
            bgGradient="to-b"
            gradientFrom="blue.500"
            gradientVia="purple.500"
            gradientTo="green.500"
            transform={{ base: "none", md: "translateX(-50%)" }}
            zIndex={0}
            borderBottomRadius="full" // Soft end
            boxShadow="0 0 12px rgba(139, 92, 246, 0.4)"
          />

          {items.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              index={index}
              isLeft={index % 2 === 0}
              onUpdateDeliverables={handleUpdateDeliverables}
              onUpdateStatus={handleUpdateStatus}
              isExpanded={expandedId === item.id}
              onToggleExpand={() => handleToggleExpand(item.id)}
              onDeleteItem={handleDeleteItem}
              onEditItem={openEditModal}
            />
          ))}
        </Box>

        {/* Future/Placeholder Section - Dashed Line Logic */}
        <Box position="relative">
          {/* Dashed Connector Line */}
          <Box
            position="absolute"
            left={{ base: "39px", md: "50%" }}
            top="0"
            bottom="50%" // Go halfway down to the icon
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

      {/* Removed old AddCardButton */}

      {/* Unified Card Modal */}
      <CardModal isOpen={modalState.isOpen} onClose={closeModal} onSave={handleSaveItem} initialData={modalState.mode === "edit" ? modalState.data : null} />
    </Box>
  );
};
