"use client";

import { Box, Text, Flex } from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import { Calendar, Flag, Clock } from "lucide-react";
import { Deliverable, computeCardDuration } from "./types";

interface DurationLabelProps {
  deliverables: Deliverable[];
  isLeft: boolean;
}

export const DurationLabel = ({ deliverables, isLeft }: DurationLabelProps) => {
  const computed = computeCardDuration(deliverables);

  // Styling for the date pills
  const datePillStyles = {
    px: 2.5,
    py: 1,
    bg: "white",
    borderRadius: "full",
    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
    borderWidth: "1px",
    borderColor: "gray.100",
    fontSize: "xs",
    fontWeight: "600",
    color: "gray.600",
    gap: 1.5,
    alignItems: "center",
    display: "flex",
  };

  if (!computed) {
    return (
      <Box position="absolute" top="-34px" left="0" right="0" zIndex={5} width="100%">
        <Flex justify="center" align="center" width="100%">
          <Flex {...datePillStyles} bg="gray.50" color="gray.400" borderColor="gray.100">
            <Calendar size={12} />
            <Text>No deliverables</Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "MMM d");
  };

  return (
    <Box position="absolute" top="-38px" left="0" right="0" zIndex={5} width="100%">
      <Flex justify="space-between" align="center" width="100%" px={1}>
        {/* Start Date (Left) */}
        <Flex {...datePillStyles}>
          <Calendar size={12} color="var(--chakra-colors-gray-400)" />
          <Text>{formatDate(computed.startDate)}</Text>
        </Flex>

        {/* Center Duration Connector */}
        <Flex flex={1} align="center" justify="center" position="relative" mx={2}>
          {/* Dashed Line */}
          <Box
            position="absolute"
            left="0"
            right="0"
            top="50%"
            height="1px"
            bg="gray.300"
            backgroundImage="linear-gradient(to right, var(--chakra-colors-gray-300) 50%, rgba(255,255,255,0) 0%)"
            backgroundPosition="bottom"
            backgroundSize="6px 1px"
            backgroundRepeat="repeat-x"
            zIndex={0}
          />

          {/* Duration Pill */}
          <Flex
            position="relative"
            zIndex={1}
            px={3}
            py={0.5}
            bg="purple.50"
            borderRadius="full"
            borderWidth="1px"
            borderColor="purple.200"
            color="purple.700"
            fontSize="xs"
            fontWeight="bold"
            boxShadow="0 2px 6px rgba(128, 90, 213, 0.15)"
            align="center"
            gap={1.5}
          >
            <Clock size={12} />
            <Text>{computed.durationDays} Days</Text>
          </Flex>
        </Flex>

        {/* End Date (Right) */}
        <Flex {...datePillStyles}>
          <Text>{formatDate(computed.endDate)}</Text>
          <Flag size={12} color="var(--chakra-colors-gray-400)" />
        </Flex>
      </Flex>
    </Box>
  );
};
