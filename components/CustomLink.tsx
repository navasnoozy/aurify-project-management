import { Link as ChakraLink, type LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { forwardRef } from "react";
import Link from "next/link";

// combine Chakra styling props with React Router's navigation props
interface AppLinkProps extends ChakraLinkProps {
  to: string;
}

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>((props, ref) => {
  const { to, children, ...chakraProps } = props;

  return (
    <ChakraLink
      asChild
      ref={ref}
      // Replicating your original 'display: flex' using Chakra's native prop
      display="flex"
      // 'alignItems' is usually required when making a link 'flex' to center text vertically
      alignItems="center"
      {...chakraProps}
    >
      <Link href={to}>{children}</Link>
    </ChakraLink>
  );
});

AppLink.displayName = "AppLink";
