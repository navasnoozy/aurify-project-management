"use client";

import { Box, Flex, Text, Heading } from "@chakra-ui/react";
import { Timeline } from "@/components/roadmap/Timeline";
import { AppButton } from "@/components/AppButton";
import { LuRocket } from "react-icons/lu";
import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      {/* Header with Edit Functionality */}
      <RoadmapHeader />

      {/* Timeline */}
      <Timeline />

      {/* Floating Action Button (Launch V1.0) */}
      <Box position="fixed" bottom={8} left="50%" transform="translateX(-50%)" zIndex={20}>
        <AppButton size="lg" colorPalette="green" boxShadow="xl" px={8}>
          <LuRocket style={{ marginRight: "8px" }} /> Launch V1.0
        </AppButton>
      </Box>
    </Box>
  );
}
