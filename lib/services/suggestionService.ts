import axiosInstance from "@/lib/axios";
import { CreateSuggestionInput, UpdateSuggestionInput } from "@/lib/schemas/suggestion";
import { Suggestion } from "@/components/roadmap/types";

const BASE_URL = "/api/suggestions";

export const suggestionService = {
  // Fetch suggestions by card ID
  getByCardId: async (cardId: string): Promise<Suggestion[]> => {
    const response = await axiosInstance.get(`${BASE_URL}?cardId=${cardId}`);
    return response.data;
  },

  // Create new suggestion
  create: async (data: CreateSuggestionInput): Promise<Suggestion> => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  // Update suggestion
  update: async (id: string, data: UpdateSuggestionInput): Promise<Suggestion> => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete suggestion
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
