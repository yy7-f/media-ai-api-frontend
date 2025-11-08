"use client";
import { Toaster } from "react-hot-toast";

export default function ToasterClient() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: { fontSize: 14 },
        success: { duration: 2500 },
        error: { duration: 4000 },
      }}
    />
  );
}
