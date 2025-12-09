// src/components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import api from "@/lib/api";

type NavLink = {
  href: string;
  label: string;
  comingSoon?: boolean;
  disabled?: boolean;
};

const LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [apiStatus, setApiStatus] =
    useState<"ok" | "fail" | "checking">("checking");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // health check using axios client (includes API-Key)
  useEffect(() => {
    async function checkAPI() {
      try {
        if (!process.env.NEXT_PUBLIC_API_BASE) {
          setApiStatus("fail");
          return;
        }
        const res = await api.get("/health/");
        setApiStatus(res.status === 200 ? "ok" : "fail");
      } catch (err) {
        console.error("Health check error:", err);
        setApiStatus("fail");
      }
    }

    checkAPI();
    const interval = setInterval(checkAPI, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderNavLabel = (link: NavLink) => {
    if (link.comingSoon) {
      return (
        <span className="flex items-center gap-1">
          <span>{link.label}</span>
          <span className="text-[10px] uppercase tracking-wide rounded-full px-2 py-0.5 bg-gray-200 text-gray-600">
            Coming Soon
          </span>
        </span>
      );
    }
    return link.label;
  };

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
        {/* Left: logo + API status */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden rounded border px-2 py-1 text-sm"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <Link href="/" className="text-lg font-semibold">
            Media AI Tools
          </Link>

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
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
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

        {/* Right: nav + auth */}
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-2">
            {LINKS.map((l) => {
              const active =
                pathname === l.href ||
                (l.href.startsWith("/tools") && pathname.startsWith("/tools"));

              const baseClasses =
                "rounded px-3 py-2 text-sm transition whitespace-nowrap";
              const activeClasses = active
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100";
              const disabledClasses =
                "text-gray-400 cursor-not-allowed bg-transparent hover:bg-transparent";

              if (l.disabled) {
                return (
                  <button
                    key={l.href + l.label}
                    type="button"
                    className={`${baseClasses} ${disabledClasses}`}
                    title={l.comingSoon ? "Coming soon" : "Not available yet"}
                    disabled
                  >
                    {renderNavLabel(l)}
                  </button>
                );
              }

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`${baseClasses} ${activeClasses}`}
                >
                  {renderNavLabel(l)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 text-sm">
            {status === "loading" && (
              <span className="text-gray-500">Checking user…</span>
            )}

            {status === "unauthenticated" && (
              <button
                onClick={() => router.push("/login")}
                className="rounded bg-black text-white px-3 py-1.5 text-sm"
              >
                Sign in
              </button>
            )}

            {status === "authenticated" && (
              <>
                <span className="hidden sm:inline text-gray-700 max-w-[220px] truncate">
                  {session?.user?.email}
                  {((session?.user as any)?.plan ||
                    (session as any)?.plan) && (
                    <span className="ml-2 text-xs text-gray-500">
                      Plan:{" "}
                      {(session?.user as any)?.plan || (session as any)?.plan}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white/95 supports-[backdrop-filter]:bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-2 space-y-1">
            {LINKS.map((l) => {
              const active =
                pathname === l.href ||
                (l.href.startsWith("/tools") && pathname.startsWith("/tools"));

              const baseClasses =
                "block rounded px-3 py-2 text-sm whitespace-nowrap";
              const activeClasses = active
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100";
              const disabledClasses =
                "text-gray-400 cursor-not-allowed bg-transparent hover:bg-transparent";

              if (l.disabled) {
                return (
                  <button
                    key={l.href + l.label}
                    type="button"
                    className={`${baseClasses} ${disabledClasses}`}
                    title={l.comingSoon ? "Coming soon" : "Not available yet"}
                    disabled
                  >
                    {renderNavLabel(l)}
                  </button>
                );
              }

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`${baseClasses} ${activeClasses}`}
                >
                  {renderNavLabel(l)}
                </Link>
              );
            })}

            <div className="mt-2 border-t pt-2 flex items-center justify-between">
              {status === "unauthenticated" && (
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/login");
                  }}
                  className="rounded bg-black text-white px-3 py-1.5 text-sm"
                >
                  Sign in
                </button>
              )}
              {status === "authenticated" && (
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
