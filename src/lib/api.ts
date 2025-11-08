// import axios from "axios";
//
// export const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_BASE,
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 20000, // prevent hanging forever
// });
//
// // Auto-handle errors globally
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response) {
//       console.error("API Error:", err.response.status, err.response.data);
//     } else {
//       console.error("Network Error:", err.message);
//     }
//     return Promise.reject(err);
//   }
// );
//
// api.interceptors.request.use((config) => {
//   console.log("➡️", config.method?.toUpperCase(), config.url, config.data || "");
//   return config;
// });

// src/lib/api.ts
"use client";

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

// Add API-Key header on every request
api.interceptors.request.use((config) => {
  const key = process.env.NEXT_PUBLIC_API_KEY;
  if (key) {
    (config.headers ??= {});
    config.headers["API-Key"] = key;
  }
  return config;
});

export default api;
