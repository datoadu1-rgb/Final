/* eslint-disable react-hooks/refs */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type { FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { getMe, updateProfile } from "../../api";
import { useAuth } from "../../auth";
import {
  AuthButton,
  FormField,
  Input,
  PasswordInput,
} from "../../shared-components";
import "../catalog.css";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
};

// ---------- validation rules (the same as the server's) ----------
// an empty phone, city or address is allowed: it clears the saved value

const profileSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (value.length >= 9 &&
            value.length <= 20 &&
            /^\+?[\d\s()-]+$/.test(value)),
        "Enter a valid phone number, for example +995 555 12 34 56",
      ),
    city: z
      .string()
      .refine(
        (value) => value === "" || value.length >= 2,
        "City must be at least 2 characters",
      ),
    address: z
      .string()
      .refine(
        (value) => value === "" || value.length >= 5,
        "Address must be at least 5 characters",
      ),
    newPassword: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          (value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value)),
        "At least 8 characters, with a letter and a digit",
      ),
    // this repeat field is checked only here, the server never receives it
    confirmPassword: z.string(),
    currentPassword: z.string().min(1, "Enter your current password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileValues = z.infer<typeof profileSchema>;

// the fields that can be sent to the server (not the two password checks)
const profileFields = [
  "name",
  "email",
  "phone",
  "city",
  "address",
  "newPassword",
] as const;

// ---------- the page: loads the current data, then shows the form ----------

function ProfilePage() {
  const { data, isLoading, isError, refetch } = useQuery<{
    user: ProfileUser;
  }>({
    queryKey: ["me"],
    queryFn: () => getMe(localStorage.getItem("accessToken") ?? ""),
    gcTime: 0,
  });

  if (isLoading) {
    return (
      <div className="catalog-page product-page checkout-page">
        <div className="product-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="catalog-page product-page checkout-page">
        <div className="product-container">
          <div className="catalog-message">
            <p className="catalog-message__title">
              Failed to load your profile
            </p>
            <button type="button" onClick={() => refetch()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileForm user={data.user} />;
}

// ---------- the form ----------

function ProfileForm({ user }: { user: ProfileUser }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      city: user.city ?? "",
      address: user.address ?? "",
      newPassword: "",
      confirmPassword: "",
      currentPassword: "",
    },
  });

  const nameField = form.register("name");
  const emailField = form.register("email");
  const phoneField = form.register("phone");
  const cityField = form.register("city");
  const addressField = form.register("address");
  const newPasswordField = form.register("newPassword");
  const confirmField = form.register("confirmPassword");
  const currentField = form.register("currentPassword");

  const errors = form.formState.errors;
  const dirtyFields = form.formState.dirtyFields;
  const isSubmitting = form.formState.isSubmitting;

  // which profile fields were changed compared to the loaded data
  const changedFields = profileFields.filter((field) => dirtyFields[field]);
  const hasChanges = changedFields.length > 0;

  async function onSubmit(values: ProfileValues) {
    setFormError("");
    setSuccess("");

    // the current password is always sent, and only the fields that changed
    const body: Record<string, string> = {
      currentPassword: values.currentPassword,
    };

    changedFields.forEach((field) => {
      body[field] = values[field];
    });

    try {
      const result = await updateProfile(body);
      const saved: ProfileUser = result.user;

      // the header (and everything that shows the user) gets the new data
      auth.updateUser(saved);

      // the form now starts from the saved data, and the password fields are empty
      form.reset({
        name: saved.name ?? "",
        email: saved.email ?? "",
        phone: saved.phone ?? "",
        city: saved.city ?? "",
        address: saved.address ?? "",
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
      });

      setSuccess("Changes saved");
    } catch (error) {
      const apiError = error as {
        code?: string;
        errors?: Record<string, string>;
      };

      if (apiError.code === "INVALID_CURRENT_PASSWORD") {
        // this is a 400, not a 401: the user stays logged in
        form.setError("currentPassword", { message: "Password is incorrect" });
      } else if (apiError.code === "EMAIL_TAKEN") {
        form.setError("email", {
          message: "This email is already registered",
        });
      } else if (apiError.code === "VALIDATION_ERROR" && apiError.errors) {
        const serverErrors = apiError.errors;

        Object.keys(serverErrors).forEach((key) => {
          if (key === "_") {
            setFormError("Nothing to change");
          } else {
            form.setError(key as FieldPath<ProfileValues>, {
              message: serverErrors[key],
            });
          }
        });
      } else if (
        apiError.code === "UNAUTHORIZED" ||
        apiError.code === "TOKEN_EXPIRED"
      ) {
        auth.logout();
        navigate("/login?redirect=/profile");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="catalog-page product-page checkout-page">
      <div className="product-container">
        <div className="product-topbar">
          <Link className="product-back" to="/catalog">
            ← Back to catalog
          </Link>
          <AuthButton />
        </div>

        <h1>My profile</h1>

        <form
          className="profile-form"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <section className="checkout-section">
            <h2>Account</h2>

            <FormField label="Name" htmlFor="name" error={errors.name?.message}>
              <Input
                id="name"
                name={nameField.name}
                onChange={nameField.onChange}
                ref={nameField.ref}
                disabled={isSubmitting}
                error={!!errors.name}
                autoComplete="name"
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
                disabled={isSubmitting}
                error={!!errors.email}
                autoComplete="email"
              />
            </FormField>
          </section>

          <section className="checkout-section">
            <h2>Delivery details</h2>

            <p className="checkout-hint">
              The saved address is filled in automatically when you order.
            </p>

            <FormField
              label="Phone"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                name={phoneField.name}
                onChange={phoneField.onChange}
                ref={phoneField.ref}
                disabled={isSubmitting}
                error={!!errors.phone}
                placeholder="+995 555 12 34 56"
                autoComplete="tel"
              />
            </FormField>

            <div className="checkout-row">
              <FormField
                label="City"
                htmlFor="city"
                error={errors.city?.message}
              >
                <Input
                  id="city"
                  name={cityField.name}
                  onChange={cityField.onChange}
                  ref={cityField.ref}
                  disabled={isSubmitting}
                  error={!!errors.city}
                  autoComplete="address-level2"
                />
              </FormField>

              <FormField
                label="Address"
                htmlFor="address"
                error={errors.address?.message}
              >
                <Input
                  id="address"
                  name={addressField.name}
                  onChange={addressField.onChange}
                  ref={addressField.ref}
                  disabled={isSubmitting}
                  error={!!errors.address}
                  autoComplete="street-address"
                />
              </FormField>
            </div>
          </section>

          <section className="checkout-section">
            <h2>Change password</h2>

            <p className="checkout-hint">Leave empty to keep your password.</p>

            <FormField
              label="New password"
              htmlFor="newPassword"
              error={errors.newPassword?.message}
            >
              <PasswordInput
                id="newPassword"
                name={newPasswordField.name}
                onChange={newPasswordField.onChange}
                ref={newPasswordField.ref}
                disabled={isSubmitting}
                error={!!errors.newPassword}
              />
            </FormField>

            <FormField
              label="Repeat new password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="confirmPassword"
                name={confirmField.name}
                onChange={confirmField.onChange}
                ref={confirmField.ref}
                disabled={isSubmitting}
                error={!!errors.confirmPassword}
              />
            </FormField>
          </section>

          <section className="checkout-section">
            <h2>Confirm changes</h2>

            <p className="checkout-hint">
              Enter your current password to save any change.
            </p>

            <FormField
              label="Current password"
              htmlFor="currentPassword"
              error={errors.currentPassword?.message}
            >
              <PasswordInput
                id="currentPassword"
                name={currentField.name}
                onChange={currentField.onChange}
                ref={currentField.ref}
                disabled={isSubmitting}
                error={!!errors.currentPassword}
              />
            </FormField>
          </section>

          {formError && <p className="checkout-banner">{formError}</p>}

          {success && (
            <p className="cart-message cart-message--success">{success}</p>
          )}

          {/* disabled until something changed, and while the request runs */}
          <button
            type="submit"
            className="button"
            disabled={!hasChanges || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
