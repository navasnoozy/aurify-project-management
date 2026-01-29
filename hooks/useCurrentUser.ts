import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

const useCurrentUser = () => {
  // We can optimize this by only enabling if we suspect we have a session (e.g. check cookie existence if possible, or just default to true)
  // For now, allow it to run on mount.

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/api/users/currentuser");
        return response.data.currentUser as User | null;
      } catch (error) {
        // If 401 or network error, assume no user
        return null;
      }
    },
    retry: false, // Don't retry auth checks too aggressively
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export default useCurrentUser;
