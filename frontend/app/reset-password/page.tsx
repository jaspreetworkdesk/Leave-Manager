"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import type { AxiosError } from "axios";
import api from "@/lib/axios";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import "../globals.css";
import Swal from "sweetalert2";
import Link from "next/link";
import FormInput from "@/components/ui/FormInput";

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
  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const [errors, setErrors] =
    useState<FormErrors>({});

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
      newErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!passwordConfirmation) {
      newErrors.password_confirmation =
        "Confirm password is required.";
    } else if (password !== passwordConfirmation) {
      newErrors.password_confirmation =
        "Password confirmation does not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      password: undefined,
    }));
  };

  const handlePasswordConfirmationChange = (
    value: string
  ) => {
    setPasswordConfirmation(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      password_confirmation: undefined,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!token || !email) {
      setErrorMessage(
        "This password reset link is incomplete."
      );
      return;
    }

    if (!validateFrontend()) {
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post<ResetPasswordResponse>(
          "/reset-password",
          {
            token,
            email,
            password,
            password_confirmation:
              passwordConfirmation,
          }
        );

      const successMessage =
        response.data.message ??
        "Your password has been reset successfully.";

      setErrors({});
      setMessage(successMessage);

      await Swal.fire({
        icon: "success",
        title: "Password reset",
        text: successMessage,
        confirmButtonText: "Continue to login",
      });

      /*
       * Replace prevents the user from returning
       * to the reset-password form with Back.
       */
      router.replace("/login");
    } catch (caughtError: unknown) {
      const axiosError =
        caughtError as AxiosError<ApiErrorResponse>;

      const responseData =
        axiosError.response?.data;

      const backendErrors =
        responseData?.errors;

      const newErrors: FormErrors = {
        email: backendErrors?.email?.[0],
        password: backendErrors?.password?.[0],
        password_confirmation:
          backendErrors?.password_confirmation?.[0],
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="invalidResetLink w-full max-w-md border p-6 rounded-lg space-y-4">
          <h1 className="text-2xl font-bold">
            Invalid reset link
          </h1>

          <p>
            This link does not contain the required
            password reset information.
          </p>

          <Link href="/forgot-password">
            Request another reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="loginFormbx w-full max-w-md border p-6 rounded-lg space-y-4"
        noValidate
      >
        {message && (
          <div
            role="status"
            className="apiStatusMessage"
          >
            {message}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="apiErrorMessage"
          >
            {errorMessage}
          </div>
        )}

        <h1 className="text-2xl font-bold">
          Reset Password
        </h1>

        <FormInput
          label=""
          type="email"
          value={email}
          placeholder="Email"
          error={errors.email}
          onChange={() => {}}
          className="inputDisabled"
          disabled
        />

        <FormInput
          label=""
          type="password"
          placeholder="New password"
          value={password}
          error={errors.password}
          onChange={handlePasswordChange}
        />

        <FormInput
          label=""
          type="password"
          placeholder="Confirm password"
          value={passwordConfirmation}
          error={errors.password_confirmation}
          onChange={
            handlePasswordConfirmationChange
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? "Resetting..."
            : "Reset password"}
        </button>

        <Link
          href="/login"
          className="loginRedirectBt"
        >
          Return to login
        </Link>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading reset form...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}