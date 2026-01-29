import { Button, type ButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";
import Link from "next/link";

interface AppButtonProps extends Omit<ButtonProps, "as"> {
  to?: string;
  isLoading?: boolean;
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(({ to, children, isLoading, ...props }, ref) => {
  // Pattern 1: If it's a link, use asChild for composition with Next.js Link
  if (to) {
    return (
      <Button asChild ref={ref} rounded="full" loading={isLoading} {...props}>
        <Link href={to}>{children}</Link>
      </Button>
    );
  }

  // Pattern 2: Standard Button behavior
  return (
    <Button ref={ref} rounded="full" loading={isLoading} {...props}>
      {children}
    </Button>
  );
});

AppButton.displayName = "AppButton";
