"use client";

import { Box, Flex, Text, Spinner, Textarea, Stack } from "@chakra-ui/react";
import { useSuggestions, useCreateSuggestion, useUpdateSuggestion, useDeleteSuggestion } from "@/hooks/useSuggestions";
import { SuggestionItem } from "./SuggestionItem";
import { useState } from "react";
import { AppButton } from "@/components/AppButton";
import { Send } from "lucide-react";
import { toast } from "react-toastify";
import { SuggestionStatus, RoadmapItem, Deliverable, Suggestion } from "./types";

// Type for the promotion form data
interface PromoteFormData {
  text: string;
  startDate?: string;
  duration: number;
}
import { PromoteToDeliverableDialog } from "./PromoteToDeliverableDialog";
import { useUpdateRoadmapItem } from "@/hooks/useRoadmap";

interface SuggestionSectionProps {
  cardId: string;
  roadmapItem: RoadmapItem;
}

export const SuggestionSection = ({ cardId, roadmapItem }: SuggestionSectionProps) => {
  const { data: suggestions = [], isLoading } = useSuggestions(cardId);
  const createMutation = useCreateSuggestion(cardId);
  const updateMutation = useUpdateSuggestion(cardId);
  const deleteMutation = useDeleteSuggestion(cardId);
  const updateRoadmapItemMutation = useUpdateRoadmapItem();

  const [newContent, setNewContent] = useState("");

  const handleAddSuggestion = () => {
    if (!newContent.trim()) return;
    if (newContent.length < 10) {
      toast.error("Suggestion must be at least 10 characters long.");
      return;
    }

    createMutation.mutate(
      { cardId, content: newContent },
      {
        onSuccess: () => {
          setNewContent("");
          toast.success("Suggestion added!");
        },
        onError: () => {
          toast.error("Failed to add suggestion.");
        },
      },
    );
  };

  const [promoteSuggestion, setPromoteSuggestion] = useState<Suggestion | null>(null);

  const handleUpdate = (id: string, data: { content?: string; status?: SuggestionStatus }) => {
    // If setting status to "Taken as Key Delivery", don't update immediately. Open dialog.
    // Logic moved to SuggestionItem or handled here?
    // SuggestionItem calls onUpdate.
    // If data.status === "Taken as Key Delivery", we intercept.

    // BUT, SuggestionItem already handles the interception for "Taken as Key Delivery" check if we pass onPromote?
    // Let's pass onPromote to SuggestionItem.
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => toast.success("Suggestion updated"),
        onError: () => toast.error("Failed to update suggestion"),
      },
    );
  };

  const handlePromoteClick = (suggestion: Suggestion) => {
    setPromoteSuggestion(suggestion);
  };

  const handlePromoteConfirm = (formData: PromoteFormData) => {
    // 1. Create Deliverable
    // We need to call an API to add a deliverable to the roadmap item.
    // OR we can pass a callback prop `onAddDeliverable` from the parent (Timeline -> Modal -> Section).

    // Actually, we should probably update the suggestion status FIRST (or in parallel).
    if (!promoteSuggestion) return;

    // TODO: Phase 4 Integration
    // We need the parent component to handle the actual "Add Deliverable" logic because it owns the Roadmap Data.
    // So we should expose `onPromoteSuggestion` prop from this component.
    console.log("Promoting:", promoteSuggestion, "Data:", formData);

    // For now, let's just update the status to "Taken as Key Delivery" to complete the visible flow
    updateMutation.mutate(
      { id: promoteSuggestion.id, data: { status: "Taken as Key Delivery" } },
      {
        onSuccess: () => {
          toast.success("Suggestion promoted!");
          setPromoteSuggestion(null);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Suggestion deleted"),
      onError: () => toast.error("Failed to delete suggestion"),
    });
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="lg" color="purple.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Suggestions
      </Text>

      {/* Add New Suggestion Form */}
      <Box mb={8} bg="gray.50" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.100">
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
          Shoot your requirement!
        </Text>
        <Textarea placeholder="Describe your suggestion (min 10 characters)..." value={newContent} onChange={(e) => setNewContent(e.target.value)} minH="100px" bg="white" mb={3} resize="vertical" />
        <Flex justify="flex-end">
          <AppButton onClick={handleAddSuggestion} isLoading={createMutation.isPending} disabled={!newContent.trim()} colorPalette="purple" size="sm">
            <Send size={14} style={{ marginRight: "6px" }} />
            Submit Requirement
          </AppButton>
        </Flex>
      </Box>

      {/* Suggestions List */}
      <Stack gap={4}>
        {suggestions.length === 0 ? (
          <Flex direction="column" align="center" justify="center" p={8} bg="gray.50" borderRadius="lg" borderStyle="dashed" borderWidth="2px" borderColor="gray.200">
            <Text color="gray.400" fontStyle="italic">
              No suggestions yet.
            </Text>
          </Flex>
        ) : (
          suggestions.map((s) => <SuggestionItem key={s.id} suggestion={s} cardId={cardId} onUpdate={handleUpdate} onDelete={handleDelete} onPromote={handlePromoteClick} />)
        )}
      </Stack>

      <PromoteToDeliverableDialog isOpen={!!promoteSuggestion} onClose={() => setPromoteSuggestion(null)} suggestion={promoteSuggestion} onPromote={handlePromoteConfirm} />
    </Box>
  );
};
