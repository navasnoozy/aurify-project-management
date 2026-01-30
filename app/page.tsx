"use client";

import { Box, Flex, Text, Heading } from "@chakra-ui/react";
import { Timeline } from "@/components/roadmap/Timeline";
import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" py={{ base: 8, md: 6, "2xl": 12 }}>
      {/* Top Header with User Auth */}
      <Header />

      {/* Header with Edit Functionality */}
      <RoadmapHeader />

      {/* Timeline */}
      <Timeline />
    </Box>
  );
}
