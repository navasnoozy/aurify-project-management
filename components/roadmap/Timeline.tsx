"use client";

import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { TimelineItem } from "./TimelineItem";
import { ROADMAP_DATA, RoadmapItem, Deliverable, TaskStatus } from "./data";

export const Timeline = () => {
  // Local state for frontend-only editing
  const [items, setItems] = useState<RoadmapItem[]>(ROADMAP_DATA);

  const handleUpdateDeliverables = (id: string, deliverables: Deliverable[]) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, deliverables } : item)));
  };

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <Box position="relative" width="full" maxWidth="4xl" mx="auto" p={4}>
      {/* Central Line */}
      <Box
        position="absolute"
        left={{ base: "32px", md: "50%" }}
        top="0"
        bottom="0"
        width="2px"
        bgGradient="to-b"
        gradientFrom="blue.400"
        gradientTo="green.400"
        transform={{ base: "none", md: "translateX(-50%)" }}
        zIndex={0}
      />

      <Flex direction="column">
        {items.map((item, index) => (
          <TimelineItem key={item.id} item={item} index={index} isLeft={index % 2 === 0} onUpdateDeliverables={handleUpdateDeliverables} onUpdateStatus={handleUpdateStatus} />
        ))}
      </Flex>
    </Box>
  );
};
