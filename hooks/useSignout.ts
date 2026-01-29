import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { setAccessToken } from "@/lib/axios";
import { AxiosError } from "axios";

interface ApiResponse {
  success: boolean;
  message: string;
}

const useSignout = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, AxiosError<ApiResponse>, void>({
    mutationKey: ["signout"],
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/api/users/signout");
      return data;
    },
    onSuccess: () => {
      // Clear client-side access token
      setAccessToken(null);
      // Clear persist flag from localStorage
      localStorage.removeItem("persist");
      // Invalidate currentUser query to update UI state
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export default useSignout;
