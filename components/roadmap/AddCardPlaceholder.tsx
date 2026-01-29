"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import useCurrentUser from "@/hooks/useCurrentUser";

interface AddCardPlaceholderProps {
  onClick: () => void;
  isLeft: boolean;
}

const MotionBox = motion.create(Box);

export const AddCardPlaceholder = ({ onClick, isLeft }: AddCardPlaceholderProps) => {
  const { data: currentUser } = useCurrentUser();

  return (
    <Flex
      position="relative"
      width="100%"
      mb={{ base: 3, md: 8, "2xl": 12 }}
      mt={{ base: 2, md: 2, "2xl": 4 }}
      minH={{ base: "100px", md: "120px" }}
      direction={{ base: "column", md: "row" }}
      align={{ base: "flex-start", md: "center" }}
    >
      {/* Icon Circle on the line - Ghost version */}
      <Box
        position="absolute"
        left={{ base: "20px", md: "50%" }}
        top={{ base: "0", md: "50%" }}
        transform={{ base: "translateY(0)", md: "translate(-50%, -50%)" }}
        zIndex={10}
        bg="white"
        p={1}
        borderRadius="full"
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={currentUser ? "gray.300" : "gray.200"}
      >
        <Box width={{ base: "24px", md: "32px" }} height={{ base: "24px", md: "32px" }} borderRadius="full" bg="gray.100" display="flex" alignItems="center" justifyContent="center">
          <Plus size={16} color={currentUser ? "#A0AEC0" : "#CBD5E0"} />
        </Box>
      </Box>

      {/* Content Card */}
      <MotionBox
        as="button"
        onClick={currentUser ? onClick : () => {}} // No-op if logged out, or redirect
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={currentUser ? { scale: 1.02 } : {}}
        whileTap={currentUser ? { scale: 0.98 } : {}}
        width={{ base: "calc(100% - 60px)", md: "46%", lg: "44%" }}
        ml={{ base: "60px", md: isLeft ? "0" : "auto" }}
        mr={{ base: "0", md: isLeft ? "auto" : "0" }}
        pl={isLeft ? 0 : { base: 0, md: 8 }}
        pr={isLeft ? { base: 0, md: 8 } : 0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        textAlign="left"
        cursor={currentUser ? "pointer" : "not-allowed"}
        role="group"
      >
        <Box
          width="100%"
          h="100%"
          minH="120px"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor={currentUser ? "gray.300" : "gray.200"}
          borderRadius="xl"
          bg={currentUser ? "gray.50" : "gray.50"} // Could be lighter check
          transition="all 0.2s"
          _hover={
            currentUser
              ? {
                  borderColor: "blue.400",
                  bg: "blue.50",
                  boxShadow: "lg",
                }
              : {}
          }
          p={6}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          color={currentUser ? "gray.500" : "gray.400"}
          _groupHover={currentUser ? { color: "blue.500" } : {}}
        >
          {currentUser ? (
            <>
              <Box p={3} borderRadius="full" bg="white" boxShadow="sm" _groupHover={{ bg: "blue.500", color: "white" }} transition="all 0.2s">
                <Plus size={24} strokeWidth={2.5} />
              </Box>
              <Text fontWeight="semibold" fontSize="md">
                Add Next Milestone
              </Text>
              <Text fontSize="sm" opacity={0.7} fontWeight="medium">
                Click to create card
              </Text>
            </>
          ) : (
            <>
              <Text fontWeight="semibold" fontSize="md">
                Log in to add milestones
              </Text>
            </>
          )}
        </Box>
      </MotionBox>
    </Flex>
  );
};
