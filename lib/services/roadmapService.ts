import axiosInstance from "@/lib/axios";
import { RoadmapItem } from "@/components/roadmap/types";
import { AddCardInput } from "@/lib/schemas/roadmap";

const BASE_URL = "/api/roadmap";

// Note: Backend returns items with `id` (string) matching frontend types
export const roadmapService = {
  // Fetch all items
  getAll: async (): Promise<RoadmapItem[]> => {
    const response = await axiosInstance.get(BASE_URL);
    // Backend returns objects where `iconName` is string.
    // Frontend expects `icon` (component).
    // We need to map `iconName` -> `IconComponent` here or in the hook.
    // However, for clean separation, let's return raw data and let the transformer handle it
    // OR transform it here if we can import the icon map.
    // Ideally, the service just returns data. The hook or component maps it.
    // But our types say `RoadmapItem` has `icon: IconType`.
    // So we MUST map it here to satisfy the type return.

    // We can't easily import all icons here without making this heavy.
    // Let's assume for a moment we return `RoadmapItemBackend` type and map later,
    // OR we do the dynamic import mapping here.
    return response.data;
  },

  // Create new item
  create: async (data: AddCardInput): Promise<RoadmapItem> => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  // Update item
  update: async (item: RoadmapItem): Promise<RoadmapItem> => {
    // We send the whole item or partial.
    // Our API expects body.
    const { id, ...rest } = item;
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, rest);
    return response.data;
  },

  // Delete item
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Reorder items
  reorder: async (itemIds: string[]): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/reorder`, { itemIds });
  },
};
