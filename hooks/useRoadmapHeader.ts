import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { RoadmapHeaderInput } from "@/lib/schemas/roadmap";

interface RoadmapHeaderData {
  titlePrefix: string;
  highlight: string;
  subtitle: string;
}

interface ApiResponse {
  data: RoadmapHeaderData;
}

export const useRoadmapHeader = () => {
  return useQuery({
    queryKey: ["roadmap-header"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse>("/api/roadmap/header");
      return data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

export const useUpdateRoadmapHeader = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoadmapHeaderInput) => {
      const { data } = await axiosInstance.put("/api/roadmap/header", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap-header"] });
    },
  });
};
