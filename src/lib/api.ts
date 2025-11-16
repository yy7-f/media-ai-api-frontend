"use client";

import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // e.g. https://.../api/v1
  timeout: 20000,
});

// Attach tokens / API key on every request
api.interceptors.request.use(async (config) => {
  const session = await getSession();

  // Start from existing headers, but force a plain object for TS
  const headers: Record<string, string> = {
    ...(config.headers as Record<string, string> | undefined),
  };

  // JWT from NextAuth (if logged in)
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`;
  }

  // Optional static API key
  if (process.env.NEXT_PUBLIC_API_KEY) {
    headers["API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
  }

  config.headers = headers;
  return config;
});

export default api;
