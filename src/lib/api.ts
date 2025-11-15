"use client";
import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE, // e.g. https://<cloud-run>/api/v1
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    (config.headers ??= {});
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  // Optional: your static API key for extra gating
  if (process.env.NEXT_PUBLIC_API_KEY) {
    (config.headers ??= {});
    config.headers["API-Key"] = process.env.NEXT_PUBLIC_API_KEY;
  }
  return config;
});

export default api;
