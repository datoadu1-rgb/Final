/* eslint-disable react-hooks/refs */
// src/pages/Register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Alert,
  AuthLayout,
  Button,
  FormField,
  Input,
  PasswordInput,
} from "../../shared-components";
import { register } from "../../api";
import { useAuth } from "../../auth";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/\d/, "Password must contain at least one digit"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(
    function (values) {
      return values.password === values.confirmPassword;
    },
    { message: "Passwords do not match", path: ["confirmPassword"] },
  );

type RegisterValues = z.infer<typeof registerSchema>;

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from
    ? location.state.from.pathname + location.state.from.search
    : "/catalog";
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });
  const auth = useAuth();
  const nameField = form.register("name");
  const emailField = form.register("email");
  const passwordField = form.register("password");
  const confirmField = form.register("confirmPassword");

  const errors = form.formState.errors;
  const isLoading = form.formState.isSubmitting;
  const formError = form.formState.errors.root?.message;
  async function onSubmit(values: RegisterValues) {
    try {
      const data = await register(values.name, values.email, values.password);
      auth.signIn(data.accessToken, data.user);
      navigate(from, { replace: true });
    } catch (error) {
      if (typeof error === "object" && error !== null && "message" in error) {
        form.setError("root", {
          message: String(error.message),
        });
      } else {
        form.setError("root", {
          message: "Something went wrong",
        });
      }
    }
  }
  return (
    <AuthLayout>
      <div className="auth-page">
        <h1>Create an account</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          {formError && <Alert type="error">{formError}</Alert>}
          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              name={nameField.name}
              onChange={nameField.onChange}
              ref={nameField.ref}
              disabled={isLoading}
              error={!!errors.name}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              name={emailField.name}
              onChange={emailField.onChange}
              ref={emailField.ref}
              disabled={isLoading}
              error={!!errors.email}
            />
          </FormField>

          <FormField
            label="Password"
            htmlFor="password"
            error={errors.password?.message}
          >
            <PasswordInput
              id="password"
              name={passwordField.name}
              onChange={passwordField.onChange}
              ref={passwordField.ref}
              disabled={isLoading}
              error={!!errors.password}
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              name={confirmField.name}
              onChange={confirmField.onChange}
              ref={confirmField.ref}
              disabled={isLoading}
              error={!!errors.confirmPassword}
            />
          </FormField>

          <Button type="submit" loading={isLoading}>
            Register
          </Button>
        </form>

        <p>
          <Link to="/login">Already have an account?</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
