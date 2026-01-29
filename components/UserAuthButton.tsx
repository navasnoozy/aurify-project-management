"use client";

import { Box, Menu, IconButton, Text, Skeleton } from "@chakra-ui/react";
import { User, LogOut } from "lucide-react";
import { AppButton } from "@/components/AppButton";
import useCurrentUser from "@/hooks/useCurrentUser";
import useSignout from "@/hooks/useSignout";
import { toast } from "react-toastify";

export const UserAuthButton = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { mutateAsync: signout, isPending: isSigningOut } = useSignout();

  const handleSignout = async () => {
    try {
      await signout();
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  // Loading state - show skeleton
  if (isLoading) {
    return <Skeleton width="40px" height="40px" borderRadius="full" />;
  }

  // Not logged in - show login button
  if (!currentUser) {
    return (
      <AppButton to="/signin" colorPalette="blue" size="sm">
        Login
      </AppButton>
    );
  }

  // Logged in - show user icon with dropdown menu
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton aria-label="User menu" variant="ghost" colorPalette="gray" rounded="full" size="md">
          <User size={20} />
        </IconButton>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content minW="200px">
          <Box px={3} py={2} borderBottomWidth="1px" borderColor="gray.200">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              {currentUser.email}
            </Text>
          </Box>
          <Menu.Item value="signout" onClick={handleSignout} disabled={isSigningOut} color="red.600" cursor="pointer">
            <LogOut size={16} />
            <Text ml={2}>Sign Out</Text>
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
};
