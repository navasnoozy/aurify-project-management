import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roadmapService } from "@/lib/services/roadmapService";
import { RoadmapItem } from "@/components/roadmap/data";
import { AddCardInput } from "@/lib/schemas/roadmap";
import { ICON_MAP, DEFAULT_ICON_NAME } from "@/components/roadmap/iconConfig";

// Transform Backend Item (iconName) -> Frontend Item (icon component)
const transformItem = (item: any): RoadmapItem => {
  return {
    ...item,
    icon: ICON_MAP[item.iconName] || ICON_MAP[DEFAULT_ICON_NAME],
  };
};

export const useRoadmapItems = () => {
  return useQuery({
    queryKey: ["roadmap"],
    queryFn: async () => {
      const data = await roadmapService.getAll();
      return data.map(transformItem);
    },
  });
};

export const useCreateRoadmapItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roadmapService.create,
    // Optimistic Update
    onMutate: async (newItemInput) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["roadmap"] });

      // Snapshot previous value
      const previousItems = queryClient.getQueryData<RoadmapItem[]>(["roadmap"]);

      // Optimistically update to new value
      if (previousItems) {
        // Create a temp item
        const tempItem: RoadmapItem = {
          id: `temp-${Date.now()}`,
          ...newItemInput,
          icon: ICON_MAP[newItemInput.iconName] || ICON_MAP[DEFAULT_ICON_NAME],
          deliverables: [],
        };
        queryClient.setQueryData<RoadmapItem[]>(["roadmap"], (old) => [...(old || []), tempItem]);
      }

      return { previousItems };
    },
    onError: (err, newItem, context) => {
      // Rollback
      if (context?.previousItems) {
        queryClient.setQueryData(["roadmap"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
    },
  });
};

export const useUpdateRoadmapItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roadmapService.update,
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ["roadmap"] });
      const previousItems = queryClient.getQueryData<RoadmapItem[]>(["roadmap"]);

      if (previousItems) {
        queryClient.setQueryData<RoadmapItem[]>(["roadmap"], (old) => (old ? old.map((item) => (item.id === updatedItem.id ? { ...item, ...updatedItem } : item)) : []));
      }
      return { previousItems };
    },
    onError: (err, newItem, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["roadmap"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
    },
  });
};

export const useDeleteRoadmapItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roadmapService.delete,
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["roadmap"] });
      const previousItems = queryClient.getQueryData<RoadmapItem[]>(["roadmap"]);

      if (previousItems) {
        queryClient.setQueryData<RoadmapItem[]>(["roadmap"], (old) => (old ? old.filter((item) => item.id !== idToDelete) : []));
      }
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["roadmap"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
    },
  });
};

export const useReorderRoadmapItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roadmapService.reorder,
    onMutate: async (newItemIds) => {
      console.log("Optimistic Reorder:", newItemIds);
      await queryClient.cancelQueries({ queryKey: ["roadmap"] });
      const previousItems = queryClient.getQueryData<RoadmapItem[]>(["roadmap"]);

      if (previousItems) {
        const idToIndex = new Map(newItemIds.map((id, index) => [id, index]));

        const newItems = [...previousItems].sort((a, b) => {
          const indexA = idToIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const indexB = idToIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return indexA - indexB;
        });

        queryClient.setQueryData<RoadmapItem[]>(["roadmap"], newItems);
      }

      return { previousItems };
    },
    onError: (err, newItemIds, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(["roadmap"], context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap"] });
    },
  });
};
