"use client";

import { Box, Flex } from "@chakra-ui/react";
import { UserAuthButton } from "@/components/UserAuthButton";

export const Header = () => {
  return (
    <Box position="fixed" top={0} right={0} left={0} zIndex={50}>
      <Flex maxW="7xl" mx="auto" px={6} py={4} justify="flex-end" align="center">
        <UserAuthButton />
      </Flex>
    </Box>
  );
};
