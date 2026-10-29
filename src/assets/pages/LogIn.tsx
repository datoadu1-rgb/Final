/* eslint-disable react-hooks/refs */

// src/assets/pages/LogIn.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Input,
  Alert,
  PasswordInput,
  FormField,
  AuthLayout,
} from "../../shared-components";
import { LoginVideo } from "./loginvideo";
import { login } from "../../api";
import { useAuth } from "../../auth";
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from
    ? location.state.from.pathname + location.state.from.search
    : "/catalog";
  const auth = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const emailField = form.register("email");
  const passwordField = form.register("password");

  async function onSubmit(values: LoginValues) {
    try {
      const data = await login(values.email, values.password);
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

  const isLoading = form.formState.isSubmitting;
  const errors = form.formState.errors;
  const formError = form.formState.errors.root?.message;
  return (
    <div className="login-page">
      <AuthLayout>
        <div className="auth-page">
          <h1>Log in</h1>

          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            {formError && <Alert type="error">{formError}</Alert>}
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

            <Button type="submit" loading={isLoading}>
              Log in
            </Button>
          </form>

          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p>
            <Link to="/register">Create an account</Link>
          </p>
          <LoginVideo />
        </div>
      </AuthLayout>
    </div>
  );
}

export default Login;
