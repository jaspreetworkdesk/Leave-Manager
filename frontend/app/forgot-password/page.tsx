"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import "../globals.css";
import Swal from "sweetalert2";
import Link from "next/link";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [loading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const handleLogin = async (e: any) => {

    e.preventDefault();

    try {

      setMessage("");
      setError("");
      setSubmitLoading(true);

      const response = await api.post("/forgot-password", {
        email,
      });

      console.log(response.data);

      setMessage(response.data.message);
      //alert("Login successful");
      //router.push("/dashboard");
      setEmail("");
    } catch (error: any) {

      console.log(error.response?.data);
      Swal.fire("Error", "Unable to send the password reset link.", "error");
     // alert("Invalid credentials");

    } finally {

      setSubmitLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">



      <form
        onSubmit={handleLogin}
        className="loginFormbx w-full max-w-md border p-6 rounded-lg space-y-4"
      >

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

        <h1 className="text-2xl font-bold">
          Forgot Password
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />


        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading ? "Sending..." : "Send password reset link"}
        </button>
        <Link href="/login" className="loginRedirectBt">
            Return to login
        </Link>

      </form>

    </div>
  );
}