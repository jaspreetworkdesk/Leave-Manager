"use client";

import { FormEvent, Suspense, useState } from "react";
import type { AxiosError } from "axios";
import api from "@/lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

type FormErrors = {
  email?: string;
  password?: string;
  password_confirmation?: string;
};

type ApiErrorResponse = {
  message?: string;
  errors?: {
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
    token?: string[];
  };
};

type ResetPasswordResponse = {
  message?: string;
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token")?.trim() ?? "";
  const email = searchParams.get("email")?.trim() ?? "";

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateFrontend = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!passwordConfirmation) {
      newErrors.password_confirmation = "Confirm password is required.";
    } else if (password !== passwordConfirmation) {
      newErrors.password_confirmation = "Password confirmation does not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!token || !email) {
      setErrorMessage("This password reset link is incomplete.");
      return;
    }

    if (!validateFrontend()) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<ResetPasswordResponse>("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      const successMessage =
        response.data.message ?? "Your password has been reset successfully.";

      setErrors({});
      setMessage(successMessage);

      await Swal.fire({
        icon: "success",
        title: "Password reset",
        text: successMessage,
        confirmButtonText: "Continue to login",
      });

      router.replace("/login");
    } catch (caughtError: unknown) {
      const axiosError = caughtError as AxiosError<ApiErrorResponse>;
      const responseData = axiosError.response?.data;
      const backendErrors = responseData?.errors;

      const newErrors: FormErrors = {
        email: backendErrors?.email?.[0],
        password: backendErrors?.password?.[0],
        password_confirmation: backendErrors?.password_confirmation?.[0],
      };

      setErrors(newErrors);

      const firstValidationError =
        newErrors.email ??
        newErrors.password ??
        newErrors.password_confirmation ??
        backendErrors?.token?.[0];

      const apiMessage =
        firstValidationError ??
        responseData?.message ??
        "Unable to reset your password.";

      setErrorMessage(apiMessage);

      await Swal.fire({
        icon: "error",
        title: "Password reset failed",
        text: apiMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <AuthShell
        eyebrow="Invalid link"
        title="This reset link cannot be used"
        subtitle="The link is missing required information or may have been copied incorrectly."
        showcaseTitle="Protecting your account comes first."
        showcaseText="Request a fresh reset link to continue securely."
      >
        <div className="auth-form">
          <div role="alert" className="apiErrorMessage">
            This link does not contain the required password reset information.
          </div>
          <Link href="/forgot-password" className="auth-submit">
            Request another reset link
          </Link>
          <Link href="/login" className="auth-link">
            Return to sign in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Create new password"
      title="Set a secure password"
      subtitle="Use at least eight characters and confirm your new password below."
      showcaseTitle="A fresh password. The same organized workspace."
      showcaseText="Create your new password, then return to your leave dashboard securely."
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {message && (
          <div role="status" className="apiStatusMessage">
            {message}
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="apiErrorMessage">
            {errorMessage}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="auth-input"
            value={email}
            readOnly
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="form-error">
              {errors.email}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="password">New password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className="auth-input"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setErrors((previous) => ({ ...previous, password: undefined }));
            }}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="form-error">
              {errors.password}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="password-confirmation">Confirm password</label>
          <input
            id="password-confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            className="auth-input"
            placeholder="Re-enter your password"
            value={passwordConfirmation}
            onChange={(event) => {
              setPasswordConfirmation(event.target.value);
              setErrors((previous) => ({
                ...previous,
                password_confirmation: undefined,
              }));
            }}
            aria-invalid={Boolean(errors.password_confirmation)}
            aria-describedby={
              errors.password_confirmation ? "password-confirmation-error" : undefined
            }
          />
          {errors.password_confirmation && (
            <p id="password-confirmation-error" className="form-error">
              {errors.password_confirmation}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Resetting password..." : "Reset password"}
        </button>

        <Link href="/login" className="auth-link">
          Return to sign in
        </Link>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading reset form...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
