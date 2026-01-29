"use client";

import { Box, Card, Flex, Text, Icon } from "@chakra-ui/react";
import { RoadmapItem } from "./data";
import { StatusBadge } from "./StatusBadge";
import { DeliverablesList } from "./DeliverablesList";

interface TimelineItemPreviewProps {
  item: RoadmapItem;
}

const getStatusBorderColor = (status: string): string => {
  switch (status) {
    case "Completed":
      return "green.400";
    case "Implementing":
      return "blue.400";
    case "Planning & Research":
      return "purple.400";
    case "On Hold":
      return "orange.400";
    default:
      return "gray.300";
  }
};

export const TimelineItemPreview = ({ item }: TimelineItemPreviewProps) => {
  const borderColor = getStatusBorderColor(item.status);

  return (
    <Box width="100%" transform="scale(1.02)">
      <Card.Root variant="elevated" boxShadow="2xl" borderLeftWidth={4} borderLeftColor={borderColor} borderRadius="xl" bg="white">
        <Card.Body gap={{ base: 2, md: 1.5, "2xl": 2 }}>
          <Flex justify="space-between" align="center" mb={2}>
            {/* Visual placeholder for actions */}
            <Box />
            <StatusBadge status={item.status} onStatusChange={() => {}} />
          </Flex>

          <Text fontSize={{ base: "md", md: "sm", "2xl": "lg" }} fontWeight="bold" mt={1} letterSpacing="tight">
            {item.title}
          </Text>
          <Text fontSize="xs" color="gray.600" lineHeight="tall">
            {item.description}
          </Text>

          {/* Show simplified deliverables list */}
          <DeliverablesList deliverables={item.deliverables} isExpanded={false} onToggleExpand={() => {}} isEditable={false} onUpdate={() => {}} />
        </Card.Body>
      </Card.Root>
    </Box>
  );
};
