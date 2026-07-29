"use client";

import { FormEvent, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setSubmitLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/dashboard");
    } catch (error: any) {
      console.log(error.response?.data);
      Swal.fire("Error", "Invalid credentials", "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Enter your work email and password to continue."
      showcaseTitle="Leave management, without the paperwork."
      showcaseText="Submit requests, review balances, and keep every approval organized in one secure workspace."
    >
      <form onSubmit={handleLogin} className="auth-form" noValidate>
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

        <div className="auth-field">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password">Password</label>
            <Link href="/forgot-password" className="auth-link text-sm">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            className="auth-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
