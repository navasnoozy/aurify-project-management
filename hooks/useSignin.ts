import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance, { setAccessToken } from "@/lib/axios";
import { AxiosError } from "axios";

// Define inputs locally since we don't have @repo/schemas
interface SigninInput {
  email?: string;
  password?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: { email: string; accessToken: string };
  errors: { message: string; field?: string }[];
}

const useSigninUser = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, AxiosError<ApiResponse>, SigninInput>({
    mutationKey: ["signin"],
    mutationFn: async (credential) => {
      const { data } = await axiosInstance.post("/api/users/signin", credential);
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        // Create an artificial "currentUser" entry or invalidate to refetch
        // Ideally we should invalidate "currentUser" so it fetches fresh data from server
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }
    },
  });
};

export default useSigninUser;
