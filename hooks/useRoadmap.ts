import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roadmapService } from "@/lib/services/roadmapService";
import { RoadmapItem } from "@/components/roadmap/data";
import { AddCardInput } from "@/lib/schemas/roadmap";
import { LuDatabase, LuUsers, LuShare2, LuCalendar, LuTrendingUp, LuRocket } from "react-icons/lu";
import { IconType } from "react-icons";

// Icon mapping: String from DB -> React Component
const ICON_MAP: Record<string, IconType> = {
  LuDatabase: LuDatabase,
  LuUsers: LuUsers,
  LuShare2: LuShare2,
  LuCalendar: LuCalendar,
  LuBarChart: LuTrendingUp,
  LuRocket: LuRocket,
};

// Transform Backend Item (iconName) -> Frontend Item (icon component)
// We need a flexible type for the incoming data since it differs slightly from RoadmapItem
const transformItem = (item: any): RoadmapItem => {
  return {
    ...item,
    icon: ICON_MAP[item.iconName] || LuRocket, // Fallback to rocket
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
          icon: LuRocket, // Default
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
