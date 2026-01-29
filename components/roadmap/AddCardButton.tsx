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
    <Flex
      direction="column"
      align={{ base: "flex-start", md: "center" }} // Left align on mobile
      mt={0}
      position="relative"
      pl={{ base: "31px", md: 0 }} // Align connector visually with line (39px center - 8px half node width = 31px left edge? No. Flex align start puts content at 0. We need to shift it.)
      // Better approach: Use margin or padding to position the wrapper center-line at 39px.
      // If Flex is align start, item is at left 0.
      // We want the CENTER of the connector/button to be at 39px.
      // So we translate or margin.
    >
      {/* Wrapper to center content relative to the axis point */}
      <Flex direction="column" align="center" width={{ base: "16px", md: "auto" }} transform={{ base: "translateX(0)", md: "none" }}>
        {/* Connecting Line Extension */}
        <Box width="2px" height="40px" bgGradient="to-b" gradientFrom="green.400" gradientTo="blue.500" />

        {/* Node/Dot at the end of the line */}
        <Box width="16px" height="16px" borderRadius="full" bg="blue.500" boxShadow="0 0 12px rgba(59, 130, 246, 0.6)" mb={3} flexShrink={0} />
      </Flex>

      {/* The Button itself - Needs to be wider/shifted back if we want it centered on the line? 
          Or should the button hang off the line? 
          On mobile, if line is at 39px, putting a big button centered on 39px implies it might go offscreen left if < 100px width.
          Button is likely ~150px wide. 39px - 75px = -36px offscreen.
          
          Pro Design Decision for Mobile: 
          The Connector (Line+Dot) should satisfy the timeline continuity.
          The Button should sit NEXT to it or below it but shifted right?
          
          OR: Just shift the button so its left edge or icon aligns?
          
          Let's try "Hanging Node" design for mobile.
          Connector goes down. Node. Button is to the RIGHT of the node?
          Like a timeline item!
      */}

      <Box ml={{ base: "24px", md: 0 }} mt={{ base: "-40px", md: 0 }} pl={{ base: 4, md: 0 }}>
        {/* On mobile: Shift right and pull up to align with node? Or just sit below?
              Let's keeping it simpler first: Sit below, but careful with offscreen.
              If centered on 39px, it creates issues.
              
              Let's go with "Timeline Item" style alignment for the button on mobile.
              Line -> Node. Button next to node.
          */}
        <MotionBox
          as="button"
          onClick={onClick}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          cursor="pointer"
          bg="linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)"
          color="white"
          px={6}
          py={3}
          borderRadius="full"
          border="2px solid"
          borderColor="blue.400"
          boxShadow="0 0 20px rgba(59, 130, 246, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          _hover={{
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.6), 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            borderColor: "blue.300",
          }}
          transitionProperty="all"
          transitionDuration="0.2s"
          // Mobile: Shifts button to right of the line node
          // Desktop: Centered below line
          position={{ base: "relative", md: "static" }}
          top={{ base: "8px", md: "auto" }}
        >
          <Flex align="center" gap={2}>
            <Plus size={20} strokeWidth={2.5} />
            <Text fontWeight="bold" fontSize="sm">
              Add New Card
            </Text>
          </Flex>
        </MotionBox>
      </Box>
    </Flex>
  );
};
