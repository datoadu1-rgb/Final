/* eslint-disable react-hooks/refs */
// src/pages/ForgotPassword.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import {
  Alert,
  AuthLayout,
  Button,
  FormField,
  Input,
  PasswordInput,
} from "../../shared-components";
import { forgotPassword, verifyResetCode, resetPassword } from "../../api";

interface EmailStepProps {
  onSuccess: (email: string) => void;
}

/////////////////////////////////////////////////////////////////////////

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

type EmailValues = z.infer<typeof emailSchema>;

function EmailStep(props: EmailStepProps) {
  const form = useForm<EmailValues>({ resolver: zodResolver(emailSchema) });
  const emailField = form.register("email");
  const errors = form.formState.errors;
  const isLoading = form.formState.isSubmitting;
  const formError = form.formState.errors.root?.message;

  async function onSubmit(values: EmailValues) {
    try {
      await forgotPassword(values.email);

      props.onSuccess(values.email);
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
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {formError && <Alert type="error">{formError}</Alert>}

      <FormField label="Email" htmlFor="email" error={errors.email?.message}>
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

      <Button type="submit" loading={isLoading}>
        Send code
      </Button>
    </form>
  );
}

/////////////////////////////////////////////////////////////////////////

const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

type CodeValues = z.infer<typeof codeSchema>;

interface CodeStepProps {
  email: string;
  onSuccess: (resetToken: string) => void;
}

function CodeStep(props: CodeStepProps) {
  const form = useForm<CodeValues>({ resolver: zodResolver(codeSchema) });
  const codeField = form.register("code");
  const errors = form.formState.errors;
  const isLoading = form.formState.isSubmitting;
  const formError = form.formState.errors.root?.message;

  async function onSubmit(values: CodeValues) {
    try {
      const data = await verifyResetCode(props.email, values.code);

      props.onSuccess(data.resetToken);
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
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {formError && <Alert type="error">{formError}</Alert>}

      <Alert type="success">sent to mail</Alert>

      <FormField label="Code" htmlFor="code" error={errors.code?.message}>
        <Input
          id="code"
          name={codeField.name}
          onChange={codeField.onChange}
          ref={codeField.ref}
          disabled={isLoading}
          error={!!errors.code}
        />
      </FormField>

      <Button type="submit" loading={isLoading}>
        Verify code
      </Button>
    </form>
  );
}

/////////////////////////////////////////////////////////////////////////

const passwordSchema = z
  .object({
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

type PasswordValues = z.infer<typeof passwordSchema>;

interface NewPasswordStepProps {
  resetToken: string;
  onSuccess: () => void;
}

function NewPasswordStep(props: NewPasswordStepProps) {
  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });
  const passwordField = form.register("password");
  const confirmField = form.register("confirmPassword");
  const errors = form.formState.errors;
  const isLoading = form.formState.isSubmitting;
  const formError = form.formState.errors.root?.message;
  async function onSubmit(values: PasswordValues) {
    try {
      await resetPassword(props.resetToken, values.password);

      props.onSuccess();
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
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {formError && <Alert type="error">{formError}</Alert>}
      <FormField
        label="New password"
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
        Reset password
      </Button>
    </form>
  );
}

/////////////////////////////////////////////////////////////////////////

type Step = 1 | 2 | 3 | 4;

function ForgotPassword() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  return (
    <AuthLayout>
      <div className="auth-page">
        <h1>Reset password</h1>

        {step === 1 && (
          <EmailStep
            onSuccess={function (email) {
              setEmail(email);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <CodeStep
            email={email}
            onSuccess={function (resetToken) {
              setResetToken(resetToken);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <NewPasswordStep
            resetToken={resetToken}
            onSuccess={function () {
              setStep(4);
            }}
          />
        )}

        {step === 4 && <Alert type="success"> reset successfull</Alert>}

        <p>
          <Link to="/login"> sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
