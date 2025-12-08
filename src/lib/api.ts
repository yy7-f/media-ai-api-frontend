// src/lib/api.ts
"use client";

import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // e.g. https://...run.app/api/v1
  timeout: 10 * 60 * 1000, // 10 minutes
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// Attach tokens / API key on every request
api.interceptors.request.use(
  async (config: any) => {
    const session = await getSession();

    if (!config.headers) {
      config.headers = {};
    }

    // NextAuth accessToken → Authorization header (if you need it later)
    if (session?.accessToken) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    // API key for Cloud Run
    if (process.env.NEXT_PUBLIC_API_KEY) {
      config.headers["API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
