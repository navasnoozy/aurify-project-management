"use client";

import { Box, Flex, Text, Textarea, Stack, Badge } from "@chakra-ui/react";
import { useState } from "react";
import { Comment } from "@/components/roadmap/types";
import { AppButton } from "@/components/AppButton";
import { Send, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { useAddComment } from "@/hooks/useSuggestions";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { addCommentSchema } from "@/lib/schemas/suggestion";

interface CommentThreadProps {
  suggestionId: string;
  cardId: string;
  comments: Comment[];
}

export const CommentThread = ({ suggestionId, cardId, comments }: CommentThreadProps) => {
  const [isExpanded, setIsExpanded] = useState(comments.length > 0);
  const [newComment, setNewComment] = useState("");
  const addCommentMutation = useAddComment(cardId);

  const handleAddComment = () => {
    const validationResult = addCommentSchema.safeParse({ content: newComment });
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0].message);
      return;
    }

    addCommentMutation.mutate(
      { suggestionId, content: newComment },
      {
        onSuccess: () => {
          setNewComment("");
          toast.success("Comment added!");
        },
        onError: () => {
          toast.error("Failed to add comment.");
        },
      },
    );
  };

  const sortedComments = [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <Box bg="gray.50" borderTopWidth="1px" borderColor="gray.100">
      {/* Collapsible Header */}
      <Flex px={4} py={2} align="center" justify="space-between" cursor="pointer" onClick={() => setIsExpanded(!isExpanded)} _hover={{ bg: "gray.100" }} transition="background 0.15s">
        <Flex align="center" gap={2}>
          <MessageSquare size={14} color="#718096" />
          <Text fontSize="xs" fontWeight="medium" color="gray.600">
            {comments.length > 0 ? `Discussion (${comments.length})` : "Start Discussion"}
          </Text>
        </Flex>
        {isExpanded ? <ChevronUp size={14} color="#718096" /> : <ChevronDown size={14} color="#718096" />}
      </Flex>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <Box px={4} pb={4}>
              {/* Comment List */}
              {sortedComments.length > 0 && (
                <Stack gap={2} mb={3}>
                  {sortedComments.map((comment) => (
                    <Box
                      key={comment.id}
                      bg={comment.isAdmin ? "purple.50" : "white"}
                      p={3}
                      borderRadius="md"
                      borderLeftWidth="3px"
                      borderLeftColor={comment.isAdmin ? "purple.400" : "gray.200"}
                      boxShadow="xs"
                    >
                      <Flex justify="space-between" align="center" mb={1}>
                        <Flex align="center" gap={2}>
                          <Text fontSize="xs" fontWeight="bold" color={comment.isAdmin ? "purple.700" : "gray.700"}>
                            {comment.authorName}
                          </Text>
                          {comment.isAdmin && (
                            <Badge size="xs" colorPalette="purple" variant="solid" fontSize="9px">
                              Team
                            </Badge>
                          )}
                        </Flex>
                        <Text fontSize="10px" color="gray.400">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </Text>
                      </Flex>
                      <Text fontSize="sm" color="gray.700">
                        {comment.content}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              )}

              {/* Add Comment Form */}
              <Box>
                <Textarea
                  placeholder="Write a reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  size="sm"
                  rows={2}
                  mb={2}
                  bg="white"
                  borderColor="gray.200"
                  _focus={{ borderColor: "purple.300", boxShadow: "0 0 0 1px var(--chakra-colors-purple-300)" }}
                />
                <Flex justify="flex-end">
                  <AppButton size="xs" colorPalette="purple" onClick={handleAddComment} isLoading={addCommentMutation.isPending} disabled={!newComment.trim()}>
                    <Send size={12} style={{ marginRight: "4px" }} />
                    Reply
                  </AppButton>
                </Flex>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};
