"use client";

import { memo, useMemo } from "react";
import { useSortable, defaultAnimateLayoutChanges, AnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TimelineItem } from "./TimelineItem";
import { motion } from "motion/react";
import { RoadmapItem, Deliverable, TaskStatus } from "./types";

interface SortableTimelineItemProps {
  item: RoadmapItem;
  index: number;
  onUpdateDeliverables: (id: string, deliverables: Deliverable[]) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: RoadmapItem) => void;
  onOpenSuggestion: (item: RoadmapItem) => void;
  forceTooltipOpen?: boolean;
}

// Custom animation config: animate during drag, but skip animation on drop
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { wasDragging } = args;
  if (wasDragging) return false;
  return defaultAnimateLayoutChanges(args);
};

// Spring config for smooth GPU-accelerated animations
const springTransition = { type: "spring" as const, stiffness: 500, damping: 30 };

const SortableTimelineItemComponent = ({
  item,
  index,
  onUpdateDeliverables,
  onUpdateStatus,
  isExpanded,
  onToggleExpand,
  onDeleteItem,
  onEditItem,
  onOpenSuggestion,
  forceTooltipOpen,
}: SortableTimelineItemProps) => {
  const { isOver, attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    animateLayoutChanges,
  });

  // Memoize styles to prevent recalculations
  const containerStyle = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      position: "relative" as const,
      zIndex: isDragging ? 0 : 1,
      // CSS will-change hints for browser optimization
      willChange: isDragging ? "transform, opacity" : "auto",
    }),
    [transform, transition, isDragging],
  );

  // Memoize animation values
  const animateValues = useMemo(
    () => ({
      scale: isOver && !isDragging ? 0.9 : 1,
      opacity: isDragging ? 0.3 : 1,
    }),
    [isOver, isDragging],
  );

  return (
    <div ref={setNodeRef} style={containerStyle}>
      <motion.div animate={animateValues} transition={springTransition} style={{ willChange: "transform, opacity" }}>
        <TimelineItem
          item={item}
          index={index}
          isLeft={index % 2 === 0}
          onUpdateDeliverables={onUpdateDeliverables}
          onUpdateStatus={onUpdateStatus}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onDeleteItem={onDeleteItem}
          onEditItem={onEditItem}
          onOpenSuggestion={onOpenSuggestion}
          dragHandleProps={{ ...listeners, ...attributes }}
          isDragging={isDragging}
          forceTooltipOpen={forceTooltipOpen}
        />
      </motion.div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const SortableTimelineItem = memo(SortableTimelineItemComponent);

SortableTimelineItem.displayName = "SortableTimelineItem";
