// src/app/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios, { AxiosError } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

type ErrorResponse = {
  message?: string;
  detail?: string;
};

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!API_BASE) {
      setError("API base URL is not configured");
      return;
    }

    try {
      setSubmitting(true);

      const base = API_BASE.replace(/\/$/, "");
      const res = await axios.post(`${base}/auth/register/`, {
        email,
        password,
      });

      if (res.status === 201) {
        router.push("/login?registered=1");
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.detail ||
        "Registration failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleRegister}
      className="bg-white p-8 rounded shadow-md w-80 space-y-4"
    >
      <h2 className="text-lg font-semibold text-center">Create Account</h2>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border p-2 rounded"
        required
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        className="w-full border p-2 rounded"
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-black text-white py-2 rounded hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Signing up..." : "Sign Up"}
      </button>

      <p className="text-xs text-center text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
