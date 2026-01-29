import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request Interceptor: Add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle Token Refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and query is NOT the refresh token endpoint itself to avoid infinite loop
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/api/users/refresh-token")) {
      originalRequest._retry = true;

      try {
        // Attempt to get a new access token
        const { data } = await axiosInstance.post("/api/users/refresh-token");

        if (data.success && data.data?.accessToken) {
          const newAccessToken = data.data.accessToken;
          setAccessToken(newAccessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed (e.g., token expired or invalid)
        setAccessToken(null);
        // We might want to trigger a redirect to login here, or let the caller handle it.
        // For Client Components, this error propagates to useQuery/useMutation logic.
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
