"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import "../globals.css";
import Swal from "sweetalert2";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
const router = useRouter();
  const handleLogin = async (e: any) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log(response.data);

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      //alert("Login successful");
      router.push("/dashboard");

    } catch (error: any) {

      console.log(error.response?.data);
      Swal.fire("Error", "Invalid credentials", "error");
     // alert("Invalid credentials");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="loginFormbx w-full max-w-md border p-6 rounded-lg space-y-4"
      >

        <h1 className="text-2xl font-bold">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading ? "Loading..." : "Login"}
        </button>

      </form>

    </div>
  );
}