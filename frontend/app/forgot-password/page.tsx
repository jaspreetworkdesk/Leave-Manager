"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/axios";
import Swal from "sweetalert2";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setMessage("");
      setError("");
      setSubmitLoading(true);

      const response = await api.post("/forgot-password", { email });

      setMessage(response.data.message);
      setEmail("");
    } catch (caughtError: any) {
      console.log(caughtError.response?.data);
      const apiMessage =
        caughtError.response?.data?.message ||
        "Unable to send the password reset link.";
      setError(apiMessage);
      Swal.fire("Error", apiMessage, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      subtitle="We will email you a secure link to create a new password."
      showcaseTitle="Get back to your workspace securely."
      showcaseText="Password recovery is quick and protected, so you can return to managing leave requests without delay."
    >
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {message && (
          <div role="status" className="apiStatusMessage">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="apiErrorMessage">
            {error}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className="auth-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Sending link..." : "Send reset link"}
        </button>

        <Link href="/login" className="auth-link">
          Return to sign in
        </Link>
      </form>
    </AuthShell>
  );
}
