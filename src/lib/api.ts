// src/lib/api.ts
"use client";

import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

const api = axios.create({
  baseURL,
  timeout: 10 * 60 * 1000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

// Attach API key + (optional) bearer token on every request
api.interceptors.request.use(
  async (config: any) => {
    const session = await getSession();

    if (!config.headers) {
      config.headers = {};
    }

    // optional: for endpoints that still use JWT
    if (session?.accessToken) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    // required: API key header for Cloud Run
    if (process.env.NEXT_PUBLIC_API_KEY) {
      config.headers["API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
