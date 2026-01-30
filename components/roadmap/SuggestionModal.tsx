"use client";

import { Dialog, Box, Flex, Text, Badge, Icon, Stack, Separator } from "@chakra-ui/react";
import { RoadmapItem } from "./types";
import { X } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { DeliverablesList } from "./DeliverablesList";
import { SuggestionSection } from "./SuggestionSection";


interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RoadmapItem | null;
}

export const SuggestionModal = ({ isOpen, onClose, item }: SuggestionModalProps) => {
  if (!item) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()} size="xl">
      <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <Dialog.Positioner justifyContent="center" alignItems="center" p={4}>
        <Dialog.Content
          width="100%"
          maxWidth="1000px" // Wide modal for two columns
          height="85vh"
          borderRadius="xl"
          boxShadow="2xl"
          bg="white"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <Dialog.Header bgGradient="to-r" gradientFrom="purple.500" gradientTo="blue.500" color="white" py={4} display="flex" justifyContent="space-between" alignItems="center">
            <Flex align="center" gap={3}>
              <Box p={2} bg="white/20" borderRadius="full">
                <Icon as={item.icon} fontSize="xl" />
              </Box>
              <Dialog.Title fontSize="xl" fontWeight="bold">
                {item.title}
              </Dialog.Title>
            </Flex>
            <Dialog.CloseTrigger asChild position="absolute" top={4} right={4} color="white/80" _hover={{ color: "white", bg: "white/20" }}>
              <Box as="button" p={1} borderRadius="md" transition="all 0.2s">
                <X size={20} />
              </Box>
            </Dialog.CloseTrigger>
          </Dialog.Header>

          {/* Body - Two Columns */}
          <Dialog.Body p={0} flex={1} overflow="hidden">
            <Flex height="100%" direction={{ base: "column", lg: "row" }}>
              {/* Left Column: Card Details (Scrollable) */}
              <Box
                flex={{ base: "none", lg: 4 }} // 40% width
                borderRightWidth={{ base: 0, lg: "1px" }}
                borderBottomWidth={{ base: "1px", lg: 0 }}
                borderColor="gray.100"
                bg="gray.50"
                overflowY="auto"
                p={6}
                maxH={{ base: "40vh", lg: "100%" }}
              >
                <Stack gap={6}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">
                      Status
                    </Text>
                    <div style={{ pointerEvents: "none" }}>
                      <StatusBadge status={item.status} onStatusChange={() => {}} />
                    </div>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} textTransform="uppercase">
                      Description
                    </Text>
                    <Text fontSize="sm" color="gray.700" lineHeight="relaxed">
                      {item.description}
                    </Text>
                  </Box>

                  <Separator borderColor="gray.200" />

                  <Box>
                    <DeliverablesList
                      deliverables={item.deliverables}
                      onUpdate={() => {}} // Read-only view in this modal? Or allow edit? Req said "replicate everything".
                      // For now, let's keep it read-only to focus on suggestions, OR pass isEditable=false
                      isExpanded={true}
                      onToggleExpand={() => {}}
                      isEditable={false} // Card details are read-only here
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Right Column: Community Suggestions (Scrollable) */}
              <Box
                flex={{ base: "none", lg: 6 }} // 60% width
                bg="white"
                overflowY="auto"
                p={6}
                display="flex"
                flexDirection="column"
              >
                <SuggestionSection cardId={item.id} roadmapItem={item} />
              </Box>
            </Flex>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
