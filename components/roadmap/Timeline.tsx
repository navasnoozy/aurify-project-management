"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Flex, Spinner, Center, Text } from "@chakra-ui/react";
import { TimelineItem } from "./TimelineItem";
import { AddCardPlaceholder } from "./AddCardPlaceholder";
import { CardModal } from "./CardModal";
import { SuggestionModal } from "./SuggestionModal";
import { RoadmapItem, Deliverable, TaskStatus, computeProjectEndDate } from "./types";
import { useRoadmapItems, useCreateRoadmapItem, useUpdateRoadmapItem, useDeleteRoadmapItem, useReorderRoadmapItems } from "@/hooks/useRoadmap";
import { AddCardInput } from "@/lib/schemas/roadmap";
import { AppButton } from "@/components/AppButton";
import { LuRocket } from "react-icons/lu";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  Announcements,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { SortableTimelineItem } from "./SortableTimelineItem";
import { TimelineItemPreview } from "./TimelineItemPreview";
import { motion } from "motion/react";

interface ModalState {
  isOpen: boolean;
  mode: "add" | "edit";
  data?: RoadmapItem;
}

// Screen reader announcements for accessibility
const announcements: Announcements = {
  onDragStart(id) {
    return `Picked up roadmap item ${id}.`;
  },
  onDragOver({ active, over }) {
    if (over) {
      return `Roadmap item ${active.id} was moved over ${over.id}.`;
    }
    return `Roadmap item ${active.id} is no longer over a droppable area.`;
  },
  onDragEnd({ active, over }) {
    if (over) {
      return `Roadmap item ${active.id} was dropped over ${over.id}.`;
    }
    return `Roadmap item ${active.id} was dropped.`;
  },
  onDragCancel({ active }) {
    return `Dragging was cancelled. Roadmap item ${active.id} was returned to its original position.`;
  },
};

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
  const [showHint, setShowHint] = useState(false); // Onboarding hint state for first item
  const [showExpandHint, setShowExpandHint] = useState(false); // Onboarding hint for expand button

  // Trigger onboarding hint on mount (only once per session)
  useEffect(() => {
    const HINT_KEY = "roadmap_drag_hint_shown_v2";
    if (typeof window !== "undefined" && !sessionStorage.getItem(HINT_KEY)) {
      const startTimer = setTimeout(() => setShowHint(true), 1200); // Show after 1.2s
      const endTimer = setTimeout(() => {
        setShowHint(false);
        sessionStorage.setItem(HINT_KEY, "true");
      }, 5000); // Hide after 5s total

      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, []);

  // Trigger expand button hint on mount (only once per user via localStorage)
  // Trigger expand button hint on mount (only once per user via localStorage)
  useEffect(() => {
    const EXPAND_HINT_KEY = "roadmap_expand_hint_shown_v3";
    if (typeof window !== "undefined" && !localStorage.getItem(EXPAND_HINT_KEY)) {
      const timer = setTimeout(() => setShowExpandHint(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissExpandHint = useCallback(() => {
    setShowExpandHint(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("roadmap_expand_hint_shown_v3", "true");
    }
  }, []);

  // Unified Modal State
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: "add",
  });

  // Sensors with robust constraints and keyboard support
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const [suggestionModalOpen, setSuggestionModalOpen] = useState(false);
  const [selectedSuggestionItem, setSelectedSuggestionItem] = useState<RoadmapItem | null>(null);

  const openSuggestionModal = useCallback((item: RoadmapItem) => {
    setSelectedSuggestionItem(item);
    setSuggestionModalOpen(true);
  }, []);

  const closeSuggestionModal = useCallback(() => {
    setSuggestionModalOpen(false);
    setSelectedSuggestionItem(null);
  }, []);

  const activeItem = items.find((i) => i.id === activeDragId) || null;

  const projectEndDate = useMemo(() => {
    return computeProjectEndDate(items);
  }, [items]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(items, oldIndex, newIndex);
          reorderMutation.mutate(newOrder.map((i) => i.id));
        }
      }
    },
    [items, reorderMutation],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleUpdateDeliverables = useCallback(
    (id: string, deliverables: Deliverable[]) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        updateItemMutation.mutate({ ...item, deliverables });
      }
    },
    [items, updateItemMutation],
  );

  const handleUpdateStatus = useCallback(
    (id: string, status: TaskStatus) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        updateItemMutation.mutate({ ...item, status });
      }
    },
    [items, updateItemMutation],
  );

  const handleSaveItem = useCallback(
    (item: RoadmapItem) => {
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
    },
    [modalState.mode, createItemMutation, updateItemMutation],
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      deleteItemMutation.mutate(id);
    },
    [deleteItemMutation],
  );

  const openAddModal = useCallback(() => {
    setModalState({ isOpen: true, mode: "add" });
  }, []);

  const openEditModal = useCallback((item: RoadmapItem) => {
    setModalState({ isOpen: true, mode: "edit", data: item });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} accessibility={{ announcements }}>
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
                  onOpenSuggestion={openSuggestionModal}
                  forceTooltipOpen={index === 0 && showHint}
                  showExpandHint={index === 0 && showExpandHint}
                  onDismissExpandHint={handleDismissExpandHint}
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

        {/* Launch V1.0 Button - At the end of the timeline */}
        <Flex justify="center" mt={12} mb={16} direction="column" align="center" gap={2}>
          <AppButton size="lg" colorPalette="green" boxShadow="xl" px={8}>
            <LuRocket style={{ marginRight: "8px" }} />
            Launch V1.0
          </AppButton>

          {/* Project End Date */}
          {projectEndDate && (
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              Target Launch:{" "}
              <Text as="span" fontWeight="bold" color="green.600">
                {projectEndDate}
              </Text>
            </Text>
          )}
        </Flex>

        <CardModal isOpen={modalState.isOpen} onClose={closeModal} onSave={handleSaveItem} initialData={modalState.mode === "edit" ? modalState.data : null} />
        <SuggestionModal isOpen={suggestionModalOpen} onClose={closeSuggestionModal} item={selectedSuggestionItem} />

        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <motion.div
              initial={{ scale: 1, rotate: 0 }}
              animate={{
                scale: 0.85,
                rotate: -2,
                filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.35))",
              }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
              style={{
                width: "100%",
                transformOrigin: "center center",
                cursor: "grabbing",
                willChange: "transform, filter",
              }}
            >
              <TimelineItemPreview item={activeItem} />
            </motion.div>
          ) : null}
        </DragOverlay>
      </Box>
    </DndContext>
  );
};
