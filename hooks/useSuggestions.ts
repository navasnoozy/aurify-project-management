import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { suggestionService } from "@/lib/services/suggestionService";
import { Suggestion, Comment as AppComment } from "@/components/roadmap/types";

export const useSuggestions = (cardId: string) => {
  return useQuery({
    queryKey: ["suggestions", cardId],
    queryFn: () => suggestionService.getByCardId(cardId),
    enabled: !!cardId, // Only fetch if cardId is present
  });
};

export const useCreateSuggestion = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suggestionService.create,
    onMutate: async (newSuggestionInput) => {
      await queryClient.cancelQueries({ queryKey: ["suggestions", cardId] });
      const previousSuggestions = queryClient.getQueryData<Suggestion[]>(["suggestions", cardId]);

      if (previousSuggestions) {
        const tempSuggestion: Suggestion = {
          id: `temp-${Date.now()}`,
          cardId: newSuggestionInput.cardId,
          content: newSuggestionInput.content,
          status: "Pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          comments: [],
        };
        queryClient.setQueryData<Suggestion[]>(["suggestions", cardId], (old) => [tempSuggestion, ...(old || [])]);
      }

      return { previousSuggestions };
    },
    onError: (err, newItem, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(["suggestions", cardId], context.previousSuggestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", cardId] });
    },
  });
};

export const useUpdateSuggestion = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => suggestionService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["suggestions", cardId] });
      const previousSuggestions = queryClient.getQueryData<Suggestion[]>(["suggestions", cardId]);

      if (previousSuggestions) {
        queryClient.setQueryData<Suggestion[]>(["suggestions", cardId], (old) => (old ? old.map((s) => (s.id === id ? { ...s, ...data } : s)) : []));
      }

      return { previousSuggestions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(["suggestions", cardId], context.previousSuggestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", cardId] });
    },
  });
};

export const useDeleteSuggestion = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suggestionService.delete,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["suggestions", cardId] });
      const previousSuggestions = queryClient.getQueryData<Suggestion[]>(["suggestions", cardId]);

      if (previousSuggestions) {
        queryClient.setQueryData<Suggestion[]>(["suggestions", cardId], (old) => (old ? old.filter((s) => s.id !== idToDelete) : []));
      }

      return { previousSuggestions };
    },
    onError: (err, id, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(["suggestions", cardId], context.previousSuggestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", cardId] });
    },
  });
};
export const useAddComment = (cardId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ suggestionId, content, authorName }: { suggestionId: string; content: string; authorName?: string }) => suggestionService.addComment(suggestionId, { content, authorName }),
    onMutate: async ({ suggestionId, content, authorName }) => {
      await queryClient.cancelQueries({ queryKey: ["suggestions", cardId] });
      const previousSuggestions = queryClient.getQueryData<Suggestion[]>(["suggestions", cardId]);

      if (previousSuggestions) {
        queryClient.setQueryData<Suggestion[]>(["suggestions", cardId], (old) => {
          if (!old) return [];
          return old.map((s) => {
            if (s.id === suggestionId) {
              const optimisitcComment: AppComment = {
                id: `temp-${Date.now()}`,
                content,
                authorName: authorName || "Anonymous", // Optimistic guess
                isAdmin: false, // Optimistic guess
                createdAt: new Date().toISOString(),
              };
              return {
                ...s,
                comments: [...(s.comments || []), optimisitcComment],
              };
            }
            return s;
          });
        });
      }

      return { previousSuggestions };
    },
    onError: (err, variables, context) => {
      if (context?.previousSuggestions) {
        queryClient.setQueryData(["suggestions", cardId], context.previousSuggestions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["suggestions", cardId] });
    },
  });
};
