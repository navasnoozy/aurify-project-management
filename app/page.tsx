"use client";

import { Box, Flex, Text, Heading } from "@chakra-ui/react";
import { Timeline } from "@/components/roadmap/Timeline";
import { AppButton } from "@/components/AppButton";
import { LuRocket } from "react-icons/lu";
import { RoadmapHeader } from "@/components/roadmap/RoadmapHeader";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" py={12}>
      {/* Top Header with User Auth */}
      <Header />

      {/* Header with Edit Functionality */}
      <RoadmapHeader />

      {/* Timeline */}
      <Timeline />

      {/* Launch V1.0 - At the end of the roadmap */}
      <Flex justify="center" mt={8} mb={16}>
        <AppButton size="lg" colorPalette="green" boxShadow="xl" px={8}>
          <LuRocket style={{ marginRight: "8px" }} /> Launch V1.0
        </AppButton>
      </Flex>
    </Box>
  );
}
