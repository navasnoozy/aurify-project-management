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
      <SimpleGrid columns={6} gap={2}>
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
              borderRadius="md"
              borderWidth="2px"
              borderColor={isSelected ? "blue.500" : "gray.200"}
              bg={isSelected ? "blue.50" : "white"}
              color={isSelected ? "blue.600" : "gray.500"}
              _hover={{
                borderColor: isSelected ? "blue.500" : "gray.300",
                bg: isSelected ? "blue.50" : "gray.50",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s"
              onClick={() => onChange(option.name)}
              height="60px"
              aria-label={`Select ${option.label}`}
            >
              <IconComponent size={20} />
              {/* Optional: Show label on hover or if space permits? 
                  For now just icon clearly. 
              */}
            </Flex>
          );
        })}
      </SimpleGrid>
    </Box>
  );
};
