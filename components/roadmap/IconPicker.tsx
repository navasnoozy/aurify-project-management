"use client";

import { Box, SimpleGrid, Flex, Text } from "@chakra-ui/react";
import { ICON_OPTIONS, IconName } from "./iconConfig";
import { IconType } from "react-icons";

interface IconPickerProps {
  value: IconName;
  onChange: (name: IconName) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
        Icon
      </Text>
      <SimpleGrid columns={{ base: 5, sm: 6 }} gap={2}>
        {ICON_OPTIONS.map((option) => {
          const IconComponent = option.component;
          const isSelected = value === option.name;

          return (
            <Flex
              as="button"
              // @ts-ignore - type is valid for button but Chakra types might be strict
              type="button"
              direction="column"
              align="center"
              justify="center"
              p={2}
              borderRadius="lg"
              borderWidth="2px"
              borderColor={isSelected ? "blue.500" : "gray.200"}
              bg={isSelected ? "blue.50" : "white"}
              color={isSelected ? "blue.600" : "gray.500"}
              ring={isSelected ? "2px" : "0"}
              ringColor="blue.400"
              ringOffset="2px"
              _hover={{
                borderColor: isSelected ? "blue.500" : "gray.300",
                bg: isSelected ? "blue.50" : "gray.50",
                transform: "scale(1.05)",
                boxShadow: "md",
              }}
              _focus={{
                ring: "2px",
                ringColor: "blue.500",
                outline: "none",
              }}
              transition="all 0.2s"
              onClick={() => onChange(option.name)}
              height="60px"
              aria-label={`Select ${option.label}`}
            >
              <IconComponent size={20} />
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
