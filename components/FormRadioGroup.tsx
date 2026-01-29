"use client";

import { Box, Flex, Field } from "@chakra-ui/react";
import { useFormContext, Controller } from "react-hook-form";

interface FormRadioGroupProps {
  name: string;
  label: string;
  options: string[];
}

const FormRadioGroup = ({ name, label, options }: FormRadioGroupProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <Field.Root invalid={!!error} width="full">
          <Field.Label fontWeight="medium" mb={2}>
            {label}
          </Field.Label>

          <Flex gap={2} flexWrap="wrap">
            {options.map((option) => (
              <Box
                key={option}
                as="label"
                cursor="pointer"
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="xs"
                fontWeight="medium"
                bg={value === option ? "purple.500" : "gray.100"}
                color={value === option ? "white" : "gray.700"}
                _hover={{
                  bg: value === option ? "purple.600" : "gray.200",
                }}
                transitionProperty="all"
                transitionDuration="0.15s"
                onClick={() => onChange(option)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onChange(option);
                  }
                }}
                tabIndex={0}
                role="radio"
                aria-checked={value === option}
              >
                <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} style={{ display: "none" }} tabIndex={-1} />
                {option}
              </Box>
            ))}
          </Flex>

          <Field.ErrorText>{error?.message?.toString()}</Field.ErrorText>
        </Field.Root>
      )}
    />
  );
};

export default FormRadioGroup;
