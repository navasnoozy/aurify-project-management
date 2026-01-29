"use client";

import { Skeleton, Flex } from "@chakra-ui/react";
import { useEffect, useState, useRef, ReactNode } from "react";
import axiosInstance, { setAccessToken } from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

interface PersistLoginProps {
  children: ReactNode;
}

const PersistLogin = ({ children }: PersistLoginProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const effectRan = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prevent double-invocation in React Strict Mode (Development)
    if (effectRan.current) return;
    effectRan.current = true;

    const verifySession = async () => {
      const isPersist = localStorage.getItem("persist");

      if (!isPersist) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.post("/api/users/refresh-token");
        if (data.success && data.data?.accessToken) {
          setAccessToken(data.data.accessToken);
          // Invalidate currentUser query to refetch with the new token
          queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        }
      } catch (err) {
        // Session expired or invalid - clear persist flag
        setAccessToken(null);
        localStorage.removeItem("persist");
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [queryClient]);

  if (isLoading) {
    return (
      <Flex width="full" height="95vh" direction="column" justify="center" align="center" gap={4} p={4}>
        <Skeleton width="full" height="100px" />
        <Skeleton width="full" flex={1} borderRadius="md" />
      </Flex>
    );
  }

  return <>{children}</>;
};

export default PersistLogin;
