"use client";

import { Box, Text, Flex } from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import { Calendar } from "lucide-react";
import { Deliverable, computeCardDuration } from "./data";

interface DurationLabelProps {
  deliverables: Deliverable[];
  isLeft: boolean;
}

export const DurationLabel = ({ deliverables, isLeft }: DurationLabelProps) => {
  const computed = computeCardDuration(deliverables);

  if (!computed) {
    return (
      <Box position="absolute" top="-26px" left={isLeft ? "auto" : "0"} right={isLeft ? "0" : "auto"} zIndex={5}>
        <Flex align="center" gap={1} px={2} py={0.5} bg="gray.100" borderRadius="full" borderWidth="1px" borderColor="gray.200">
          <Calendar size={10} color="var(--chakra-colors-gray-400)" />
          <Text fontSize="xs" fontWeight="medium" color="gray.500">
            No deliverables
          </Text>
        </Flex>
      </Box>
    );
  }

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "MMM d, yyyy");
  };

  const displayText = `${formatDate(computed.startDate)} - ${formatDate(computed.endDate)} (${computed.durationDays} days)`;

  return (
    <Box position="absolute" top="-26px" left={isLeft ? "auto" : "0"} right={isLeft ? "0" : "auto"} zIndex={5}>
      <Flex align="center" gap={1} px={2} py={0.5} bg="purple.50" borderRadius="full" borderWidth="1px" borderColor="purple.200">
        <Calendar size={10} color="var(--chakra-colors-purple-500)" />
        <Text fontSize="xs" fontWeight="medium" color="purple.700">
          {displayText}
        </Text>
      </Flex>
    </Box>
  );
};
