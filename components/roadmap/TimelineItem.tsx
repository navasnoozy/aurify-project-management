"use client";

import { Box, Card, Flex, Text, Icon } from "@chakra-ui/react";
import { RoadmapItem, Deliverable, TaskStatus } from "./data";
import { motion } from "framer-motion";
import { DurationLabel } from "./DurationLabel";
import { DeliverablesList } from "./DeliverablesList";
import { StatusBadge } from "./StatusBadge";

interface TimelineItemProps {
  item: RoadmapItem;
  index: number;
  isLeft: boolean;
  onUpdateDeliverables: (id: string, deliverables: Deliverable[]) => void;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
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

export const TimelineItem = ({ item, index, isLeft, onUpdateDeliverables, onUpdateStatus }: TimelineItemProps) => {
  const handleDeliverablesUpdate = (deliverables: Deliverable[]) => {
    onUpdateDeliverables(item.id, deliverables);
  };

  const handleStatusChange = (status: TaskStatus) => {
    onUpdateStatus(item.id, status);
  };

  const borderColor = getStatusBorderColor(item.status);

  return (
    <Flex
      justify={isLeft ? "flex-end" : "flex-start"}
      position="relative"
      width="100%"
      mb={10}
      mt={8}
      pl={isLeft ? 0 : { base: 8, md: 10 }}
      pr={isLeft ? { base: 8, md: 10 } : 0}
      direction={{ base: "column", md: "row" }}
      align={{ base: "flex-start", md: "center" }}
    >
      {/* Icon Circle on the line */}
      <Box
        position="absolute"
        left={{ base: "20px", md: "50%" }}
        top="0"
        transform={{ base: "none", md: "translateX(-50%)" }}
        zIndex={10}
        bg="white"
        p={2}
        borderRadius="full"
        boxShadow="md"
        borderWidth="2px"
        borderColor="purple.400"
      >
        <Icon as={item.icon} fontSize="2xl" color="purple.500" />
      </Box>

      {/* Content Card */}
      <MotionBox
        initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        width={{ base: "calc(100% - 60px)", md: "45%" }}
        ml={{ base: "60px", md: isLeft ? "0" : "auto" }}
        mr={{ base: "0", md: isLeft ? "auto" : "0" }}
        position="relative"
      >
        {/* Duration Label - Computed from deliverables */}
        <DurationLabel deliverables={item.deliverables} isLeft={isLeft} />

        <Card.Root variant="elevated" boxShadow="lg" borderLeftWidth={4} borderLeftColor={borderColor}>
          <Card.Body gap={3}>
            <Flex justify="flex-end" align="center" mb={2}>
              <StatusBadge status={item.status} onStatusChange={handleStatusChange} />
            </Flex>

            <Text fontSize="lg" fontWeight="bold" mt={1}>
              {item.title}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {item.description}
            </Text>

            {/* Editable Deliverables List */}
            <DeliverablesList deliverables={item.deliverables} onUpdate={handleDeliverablesUpdate} />
          </Card.Body>
        </Card.Root>
      </MotionBox>
    </Flex>
  );
};
