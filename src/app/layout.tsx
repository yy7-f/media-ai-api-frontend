// src/app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "Media Tools",
  description: "Frontend for Flask video/audio editing API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <SiteHeader />
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
