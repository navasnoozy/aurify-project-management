"use client";

import { Box, Card, Flex, Text, Badge, Icon, List } from "@chakra-ui/react";
import { RoadmapItem } from "./data";
import { motion } from "framer-motion";

interface TimelineItemProps {
  item: RoadmapItem;
  index: number;
  isLeft: boolean;
}

const MotionBox = motion.create(Box);

export const TimelineItem = ({ item, index, isLeft }: TimelineItemProps) => {
  return (
    <Flex
      justify={isLeft ? "flex-end" : "flex-start"}
      position="relative"
      width="100%"
      mb={10}
      pl={isLeft ? 0 : { base: 8, md: 10 }} // Padding for line
      pr={isLeft ? { base: 8, md: 10 } : 0}
      direction={{ base: "column", md: "row" }}
      // On mobile, everything aligns left usually, but let's keep alternating structure or specific mobile view
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
        borderColor="purple.400" // using purple theme
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
      >
        <Card.Root
          variant="elevated"
          boxShadow="lg"
          borderColor={item.status === "Completed" ? "green.200" : item.status === "In Progress" ? "blue.200" : "gray.200"}
          borderLeftWidth={4}
          borderLeftColor={item.status === "Completed" ? "green.400" : item.status === "In Progress" ? "blue.400" : "gray.300"}
        >
          <Card.Body gap={3}>
            <Flex justify="space-between" align="center" mb={2} wrap="wrap" gap={2}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" letterSpacing="wider">
                {item.month}
              </Text>
              <Badge colorPalette={item.status === "Completed" ? "green" : item.status === "In Progress" ? "blue" : "gray"} variant="solid">
                {item.status}
              </Badge>
            </Flex>

            <Text fontSize="lg" fontWeight="bold" mt={1}>
              {item.title}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {item.description}
            </Text>

            {item.deliverables && (
              <Box mt={4} bg="gray.50" p={3} borderRadius="md">
                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2}>
                  KEY DELIVERABLES
                </Text>
                <List.Root gap={1} variant="plain">
                  {item.deliverables.map((d, i) => (
                    <List.Item key={i} fontSize="sm" alignItems="center">
                      <List.Indicator as={item.status === "Completed" ? Icon : Box} color="green.500">
                        {item.status === "Completed" ? "✓" : "○"}
                      </List.Indicator>
                      {d}
                    </List.Item>
                  ))}
                </List.Root>
              </Box>
            )}
          </Card.Body>
        </Card.Root>
      </MotionBox>
    </Flex>
  );
};
