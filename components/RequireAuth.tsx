"use client";

import { useRouter } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Skeleton, Flex } from "@chakra-ui/react";
import { useEffect, ReactNode } from "react";

const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/signin");
    }
  }, [isLoading, currentUser, router]);

  if (isLoading) {
    return (
      <Flex width="full" height="95vh" direction="column" justify="center" align="center" gap={4} p={4}>
        <Skeleton width="full" height="100px" />
        <Skeleton width="full" flex={1} borderRadius="md" />
      </Flex>
    );
  }

  if (!currentUser) {
    return null; // Don't render children until redirect
  }

  return <>{children}</>;
};

export default RequireAuth;
