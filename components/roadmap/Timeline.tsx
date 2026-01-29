"use client";

import { Box, Flex } from "@chakra-ui/react";
import { TimelineItem } from "./TimelineItem";
import { ROADMAP_DATA } from "./data";

export const Timeline = () => {
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
        {ROADMAP_DATA.map((item, index) => (
          <TimelineItem key={index} item={item} index={index} isLeft={index % 2 === 0} />
        ))}
      </Flex>
    </Box>
  );
};
