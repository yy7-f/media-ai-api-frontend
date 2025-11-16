"use client";

import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // e.g. https://.../api/v1
  timeout: 20000,
});

// Attach tokens / API key on every request
api.interceptors.request.use(
  async (config: any) => {
    const session = await getSession();

    // Ensure headers exists as a plain object
    if (!config.headers) {
      config.headers = {};
    }

    // JWT from NextAuth (if logged in)
    if (session?.accessToken) {
      config.headers["Authorization"] = `Bearer ${session.accessToken}`;
    }

    // Optional static API key
    if (process.env.NEXT_PUBLIC_API_KEY) {
      config.headers["API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
