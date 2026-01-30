"use client";

import { Box, Flex, Text, IconButton, Textarea, Badge } from "@chakra-ui/react";
import { Suggestion, SuggestionStatus, SUGGESTION_STATUSES } from "./types";
import { useState } from "react";
import { Pencil, Trash2, Check, X, RotateCcw } from "lucide-react";
import useCurrentUser from "@/hooks/useCurrentUser"; // Assuming this hook exists based on context
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { StatusBadge } from "./StatusBadge"; // We might need a specific SuggestionStatusBadge or reuse
import { motion } from "motion/react";
import { Menu } from "@chakra-ui/react";
import { AppButton } from "@/components/AppButton";
import { toast } from "react-toastify";

interface SuggestionItemProps {
  suggestion: Suggestion;
  onUpdate: (id: string, data: { content?: string; status?: SuggestionStatus }) => void;
  onDelete: (id: string) => void;
  // Handler for promotion flow (Phase 4), optional for now
  onPromote?: (suggestion: Suggestion) => void;
}

export const SuggestionItem = ({ suggestion, onUpdate, onDelete, onPromote }: SuggestionItemProps) => {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = !!currentUser; // For now, any logged-in user is "admin" for these controls

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(suggestion.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    if (editContent !== suggestion.content) {
      onUpdate(suggestion.id, { content: editContent });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(suggestion.content);
    setIsEditing(false);
  };

  const handleStatusChange = (newStatus: SuggestionStatus) => {
    if (newStatus === "Taken as Key Delivery") {
      if (onPromote) {
        onPromote(suggestion);
      } else {
        toast.info("Promotion flow coming in Phase 4");
      }
    } else {
      onUpdate(suggestion.id, { status: newStatus });
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
      <Box p={4} bg="white" borderWidth="1px" borderColor="gray.100" borderRadius="lg" boxShadow="sm" _hover={{ boxShadow: "md", borderColor: "gray.200" }} transition="all 0.2s">
        {/* Header: Date + Status */}
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xs" color="gray.400">
            {new Date(suggestion.createdAt).toLocaleDateString()}
          </Text>
          {/* Status Badge - Only editable by Admin */}
          {isAdmin ? (
            <Menu.Root>
              <Menu.Trigger asChild>
                <Badge variant="subtle" colorPalette={getStatusColor(suggestion.status)} cursor="pointer" _hover={{ opacity: 0.8 }}>
                  {suggestion.status}
                </Badge>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content minW="180px">
                  {SUGGESTION_STATUSES.map((status) => (
                    <Menu.Item key={status} value={status} onClick={() => handleStatusChange(status)} bg={status === suggestion.status ? "gray.50" : undefined}>
                      <Badge variant="subtle" colorPalette={getStatusColor(status)}>
                        {status}
                      </Badge>
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          ) : (
            <Badge variant="subtle" colorPalette={getStatusColor(suggestion.status)}>
              {suggestion.status}
            </Badge>
          )}
        </Flex>

        {/* Content Area */}
        {isEditing ? (
          <Box>
            <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} size="sm" rows={3} autoFocus mb={2} />
            <Flex gap={2} justify="flex-end" align="center">
              {/* Delete - Icon only, Admin only */}
              {isAdmin && (
                <IconButton size="xs" variant="ghost" colorPalette="red" aria-label="Delete" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 size={14} />
                </IconButton>
              )}
              <IconButton size="xs" variant="ghost" aria-label="Cancel" onClick={handleCancelEdit}>
                <X size={14} />
              </IconButton>
              <IconButton size="xs" colorPalette="blue" aria-label="Save" onClick={handleSaveEdit}>
                <Check size={14} />
              </IconButton>
            </Flex>
          </Box>
        ) : (
          <Text fontSize="sm" color="gray.700" whiteSpace="pre-wrap">
            {suggestion.content}
          </Text>
        )}

        {/* Action Footer - Only visible when NOT editing */}
        {!isEditing && (
          <Flex justify="flex-end" gap={2} mt={3} pt={2} borderTopWidth="1px" borderColor="gray.50">
            {/* Edit - Available to ALL */}
            <AppButton size="xs" variant="ghost" colorPalette="gray" onClick={() => setIsEditing(true)}>
              <Pencil size={12} style={{ marginRight: "4px" }} />
              Edit
            </AppButton>

            {/* Delete - Available to ADMIN only */}
            {isAdmin && (
              <AppButton size="xs" variant="ghost" colorPalette="red" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 size={12} style={{ marginRight: "4px" }} />
                Delete
              </AppButton>
            )}
          </Flex>
        )}
      </Box>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => onDelete(suggestion.id)}
        title="Delete Suggestion"
        message="Are you sure you want to delete this suggestion? This action cannot be undone."
        confirmText="Delete"
        confirmColorPalette="red"
      />
    </motion.div>
  );
};

// Helper for status colors
const getStatusColor = (status: SuggestionStatus): string => {
  switch (status) {
    case "Pending":
      return "gray";
    case "Under Review":
      return "orange";
    case "Planned":
      return "blue";
    case "In Progress":
      return "purple";
    case "Taken as Key Delivery":
      return "green";
    case "Rejected":
      return "red";
    case "Deferred":
      return "yellow";
    case "Needs More Info":
      return "cyan";
    default:
      return "gray";
  }
};
