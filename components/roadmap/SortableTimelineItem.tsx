"use client";

import { useSortable } from "@dnd-kit/sortable";
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

export const SortableTimelineItem = ({ item, index, onUpdateDeliverables, onUpdateStatus, isExpanded, onToggleExpand, onDeleteItem, onEditItem }: SortableTimelineItemProps) => {
  const { isOver, attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: "relative" as const, // Ensure z-index works
    zIndex: isDragging ? 0 : 1, // Lower z-index for placeholder
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Motion wrapper for approach animation (shrink on approach) */}
      <motion.div animate={{ scale: isOver && !isDragging ? 0.9 : 1 }} transition={{ duration: 0.2 }}>
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
