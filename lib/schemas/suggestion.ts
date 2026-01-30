import { z } from "zod";

export const createSuggestionSchema = z.object({
  cardId: z.string().min(1, "Card ID is required"),
  content: z.string().min(10, "Suggestion must be at least 10 characters").max(1000, "Suggestion must be less than 1000 characters"),
});

export const updateSuggestionSchema = z.object({
  content: z.string().min(10, "Suggestion must be at least 10 characters").max(1000, "Suggestion must be less than 1000 characters").optional(),
  status: z.enum(["Pending", "Under Review", "Planned", "In Progress", "Needs More Info", "Deferred", "Rejected", "Taken as Key Delivery"]).optional(),
});

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>;
export type UpdateSuggestionInput = z.infer<typeof updateSuggestionSchema>;
