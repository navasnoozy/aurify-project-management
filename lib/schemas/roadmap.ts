import { z } from "zod";

export const roadmapHeaderSchema = z.object({
  titlePrefix: z.string().min(1, "Title prefix is required"),
  highlight: z.string().min(1, "Highlight text is required"),
  subtitle: z.string().min(1, "Subtitle is required"),
});

export type RoadmapHeaderInput = z.infer<typeof roadmapHeaderSchema>;

import { isValidIconName, DEFAULT_ICON_NAME } from "@/components/roadmap/iconConfig";

// ... (header schema)

// Add Card Schema
export const addCardSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  status: z.enum(["Not Started", "Planning & Research", "Implementing", "On Hold", "Completed"]),
  iconName: z
    .string()
    .refine((val) => isValidIconName(val), {
      message: "Invalid icon selection",
    })
    .default(DEFAULT_ICON_NAME),
});

export type AddCardInput = z.infer<typeof addCardSchema>;

// Reorder Cards Schema
export const reorderCardsSchema = z.object({
  itemIds: z.array(z.string()),
});

export type ReorderCardsInput = z.infer<typeof reorderCardsSchema>;
