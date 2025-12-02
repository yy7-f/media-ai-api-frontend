"use client";

import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // e.g. https://.../api/v1
  timeout: 10 * 60 * 1000, // 10 minutes
  maxBodyLength: Infinity,    // optional, safe for large uploads
  maxContentLength: Infinity, // optional, safe for large responses
});

// Attach tokens / API key on every request
api.interceptors.request.use(
  async (config: any) => {
    const session = await getSession();

    if (!config.headers) {
      config.headers = {};
    }

    if (session?.accessToken) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    if (process.env.NEXT_PUBLIC_API_KEY) {
      config.headers["API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
