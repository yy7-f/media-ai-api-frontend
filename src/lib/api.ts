// src/lib/api.ts
"use client";

import axios, {
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

// Add API-Key header on every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const key = process.env.NEXT_PUBLIC_API_KEY;

    if (key) {
      // Normalize headers to AxiosHeaders
      const headers =
        config.headers instanceof AxiosHeaders
          ? config.headers
          : new AxiosHeaders(config.headers);

      headers.set("API-Key", key);
      config.headers = headers;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
