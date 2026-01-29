import { Field, Textarea, type TextareaProps } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

interface FormTextareaProps extends TextareaProps {
  name: string;
  label: string;
}

const FormTextarea = ({ name, label, ...props }: FormTextareaProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <Field.Root invalid={!!error} width="full">
      <Field.Label fontWeight="medium">{label}</Field.Label>

      <Textarea {...register(name)} {...props} />

      <Field.ErrorText>{error?.message?.toString()}</Field.ErrorText>
    </Field.Root>
  );
};

export default FormTextarea;
