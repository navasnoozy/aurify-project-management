"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import useCurrentUser from "@/hooks/useCurrentUser";

interface AddCardButtonProps {
  onClick: () => void;
}

const MotionBox = motion.create(Box);

export const AddCardButton = ({ onClick }: AddCardButtonProps) => {
  const { data: currentUser } = useCurrentUser();

  // Only show for logged-in users
  if (!currentUser) return null;

  return (
    <Box mt={8} display="flex" justifyContent="center">
      <MotionBox
        as="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        cursor="pointer"
        bg="blue.600"
        color="white"
        px={6}
        py={3}
        borderRadius="full"
        boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        _hover={{
          scale: 1.05,
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
        transitionProperty="all"
        transitionDuration="0.2s"
      >
        <Flex align="center" gap={2}>
          <Plus size={20} strokeWidth={2.5} />
          <Text fontWeight="bold" fontSize="sm">
            Add New Card
          </Text>
        </Flex>
      </MotionBox>
    </Box>
  );
};
