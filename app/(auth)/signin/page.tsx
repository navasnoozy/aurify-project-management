"use client";

import { Card, Grid, Flex } from "@chakra-ui/react";
import { Form } from "@/components/Form";
import { signinSchema, type SigninInput } from "@/lib/schemas/auth";
import { useState } from "react";
import useAppNavigate from "@/hooks/useAppNavigate";
import useSigninUser from "@/hooks/useSignin";
import { toast } from "react-toastify";

import FormInputField from "@/components/FormInputField";
import FormPasswordField from "@/components/FormPasswordField";
import { AppButton } from "@/components/AppButton";
import AlertNotify from "@/components/Alert";

const SigninPage = () => {
  const [errors, setErrors] = useState<{ message: string; field?: string }[] | null>(null);
  const { goHome } = useAppNavigate();

  const { mutateAsync: signin, isPending } = useSigninUser();

  const handleSignin = (data: SigninInput) => {
    // using toast.promise requires a promise. signin returns a promise.
    const promise = signin(data);

    toast.promise(promise, {
      pending: "Signin...",
      success: "Welcome back",
      error: "Failed to login",
    });

    promise
      .then(() => {
        goHome();
      })
      .catch((error) => {
        setErrors(error.response?.data.errors || [{ message: "Failed to login" }]);
      });
  };

  return (
    <Grid templateColumns={{ base: "1fr", md: "1fr" }} width="full" height="100vh" flex={1}>
      {/* Centered Login Form */}
      <Flex justify="center" align="center" p={4}>
        <Card.Root width="full" maxW="sm" boxShadow="lg">
          <Card.Header>
            <Card.Title fontSize="2xl" textAlign="center">
              Sign In
            </Card.Title>
          </Card.Header>
          <Form onSubmit={handleSignin} schema={signinSchema}>
            <Card.Body gap={4}>
              <AlertNotify success={false} messages={errors} />
              <FormInputField name="email" label="Email" type="email" placeholder="Enter your email" />
              <FormPasswordField name="password" label="Password" placeholder="Enter your password" />
            </Card.Body>
            <Card.Footer display="flex" flexDirection="column" gap={4}>
              <AppButton type="submit" isLoading={isPending} width="full" colorPalette="blue">
                Sign In
              </AppButton>
            </Card.Footer>
          </Form>
        </Card.Root>
      </Flex>
    </Grid>
  );
};

export default SigninPage;
