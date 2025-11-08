import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import ToasterClient from "@/components/ToasterClient";

export const metadata = {
  title: "Media Tools",
  description: "Frontend for Flask video/audio editing API",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      {/*<body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50 antialiased transition-colors duration-300">*/}
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        <ToasterClient />
      </body>
    </html>
  );
}
