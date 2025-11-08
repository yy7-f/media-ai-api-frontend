"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/tools/trim", label: "Tools" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [apiStatus, setApiStatus] = useState<"ok" | "fail" | "checking">("checking");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔍 Health check ping
  useEffect(() => {
    async function checkAPI() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/health`);
        if (res.status === 200) setApiStatus("ok");
        else setApiStatus("fail");
      } catch {
        setApiStatus("fail");
      }
    }
    checkAPI();
    const interval = setInterval(checkAPI, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50",
        "supports-[backdrop-filter]:bg-white/70 bg-white/95 backdrop-blur",
        "transition-shadow border-b",
        scrolled ? "shadow-md border-transparent" : "shadow-none border-gray-200",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden rounded border px-2 py-1 text-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Link href="/" className="text-lg font-semibold">
            Media Tools
          </Link>

          {/* ✅ Backend status indicator (color-blind friendly) */}
          <div
            className="ml-3 flex items-center gap-2 text-sm"
            title={
              apiStatus === "ok"
                ? "API Online"
                : apiStatus === "fail"
                ? "API Offline"
                : "Checking..."
            }
          >
            <div
              className={`relative w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                apiStatus === "ok"
                  ? "bg-green-500 border-green-700"
                  : apiStatus === "fail"
                  ? "bg-red-500 border-red-700"
                  : "bg-yellow-400 border-yellow-600 animate-pulse"
              }`}
            >
              {/* Inner dot (white for visibility) */}
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <span className="hidden sm:inline text-gray-600 font-medium">
              {apiStatus === "ok"
                ? "Online"
                : apiStatus === "fail"
                ? "Offline"
                : "Checking"}
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {LINKS.map((l) => {
            const active =
              pathname === l.href || (l.href === "/tools/trim" && pathname.startsWith("/tools"));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded px-3 py-2 text-sm transition ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white/95 supports-[backdrop-filter]:bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2 space-y-1">
            {LINKS.map((l) => {
              const active =
                pathname === l.href ||
                (l.href === "/tools/trim" && pathname.startsWith("/tools"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded px-3 py-2 text-sm ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
