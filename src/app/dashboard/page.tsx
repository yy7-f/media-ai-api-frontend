"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?from=dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-sm">Checking your session…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // brief empty state while redirecting
    return null;
  }

  const userEmail = session?.user?.email ?? "User";
  // @ts-ignore
  const plan = (session?.user as any)?.plan ?? "free";

  return (
    <main className="space-y-6">
      {/* Header */}
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome back, <span className="font-medium">{userEmail}</span>.
          </p>
        </div>
        <div className="rounded-lg border bg-white px-3 py-2 text-xs text-gray-700">
          <div className="font-semibold">Plan: {plan || "free"}</div>
          <div className="text-[11px] text-gray-500">
            Free beta — usage limits may apply.
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Quick Start</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            href="/tools"
            title="Browse all tools"
            body="See the full list of video & audio tools."
          />
          <QuickLink
            href="/tools/video/trim"
            title="Trim a video"
            body="Cut the best part of a clip quickly."
          />
          <QuickLink
            href="/tools/video/crop"
            title="Crop / resize"
            body="Make your video fit TikTok, Reels, or YouTube."
          />
          <QuickLink
            href="/tools/video/resize"
            title="Resize video"
            body="Resize to common presets or custom dimensions."
          />
          <QuickLink
            href="/tools/video/watermark"
            title="Add watermark"
            body="Protect your content with a logo overlay."
          />
          <QuickLink
            href="/tools/audio-normalize"
            title="Normalize audio"
            body="Level out volume for consistent loudness."
          />
        </div>
      </section>

      {/* Info / help area */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-800">Getting started</h2>
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-700 space-y-2">
          <p>
            1. Go to{" "}
            <Link href="/tools" className="text-blue-600 underline">
              Tools
            </Link>{" "}
            and pick the operation you need (trim, crop, resize, watermark, etc.).
          </p>
          <p>
            2. Upload your media, set options, and click{" "}
            <span className="font-medium">Run</span>.
          </p>
          <p>
            3. Download the processed file and publish to YouTube, TikTok,
            Reels, or your clients.
          </p>
          <p className="text-xs text-gray-500">
            This is a minimal beta dashboard. More detailed history / usage
            views can be added later.
          </p>
        </div>
      </section>
    </main>
  );
}

function QuickLink(props: { href: string; title: string; body: string }) {
  return (
    <Link
      href={props.href}
      className="group block rounded-lg border bg-white px-4 py-3 text-sm hover:border-gray-300 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">{props.title}</h3>
        <span className="text-xs text-gray-400 group-hover:text-gray-600">
          →
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-600">{props.body}</p>
    </Link>
  );
}
