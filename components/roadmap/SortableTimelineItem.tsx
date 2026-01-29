"use client";

import { useSortable, defaultAnimateLayoutChanges, AnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TimelineItem } from "./TimelineItem";
import { motion } from "motion/react";
import { RoadmapItem, Deliverable, TaskStatus } from "./data";

interface SortableTimelineItemProps {
  item: RoadmapItem;
  index: number;
  onUpdateDeliverables: (id: string, deliverables: Deliverable[]) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: RoadmapItem) => void;
}

// Custom animation config: animate during drag, but skip animation on drop
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { isSorting, wasDragging } = args;
  // Skip animation when the item was just dropped (wasDragging)
  if (wasDragging) {
    return false;
  }
  return defaultAnimateLayoutChanges(args);
};

export const SortableTimelineItem = ({ item, index, onUpdateDeliverables, onUpdateStatus, isExpanded, onToggleExpand, onDeleteItem, onEditItem }: SortableTimelineItemProps) => {
  const { isOver, attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    animateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative" as const,
    zIndex: isDragging ? 0 : 1,
  };

  // Spring config for smooth GPU-accelerated animations
  const springTransition = { type: "spring" as const, stiffness: 500, damping: 30 };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Motion wrapper: shrink on approach (isOver), fade when being dragged */}
      <motion.div
        animate={{
          scale: isOver && !isDragging ? 0.9 : 1,
          opacity: isDragging ? 0.3 : 1,
        }}
        transition={springTransition}
      >
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
          dragHandleProps={{ ...listeners, ...attributes }}
          isDragging={isDragging}
        />
      </motion.div>
    </div>
  );
};
