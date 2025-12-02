"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/config/tools";

export default function ToolSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="md:sticky md:top-4">
        <nav className="rounded-xl border bg-white p-3">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
            Tools
          </div>
          <ul className="mt-1 space-y-1">
            {TOOLS.filter((t) => t.showInSidebar !== false).map((t) => {
              const isLive = t.status === "live";

              // Coming soon: greyed out, no link
              if (!isLive) {
                return (
                  <li key={t.id}>
                    <div className="block rounded-lg px-3 py-2 text-sm text-gray-400 cursor-not-allowed border border-dashed border-gray-200 bg-gray-50">
                      {t.sidebarLabel}{" "}
                      <span className="text-[10px] ml-1">(soon)</span>
                    </div>
                  </li>
                );
              }

              const active = pathname === t.slug;

              return (
                <li key={t.id}>
                  <Link
                    href={t.slug}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${
                      active
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t.sidebarLabel}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-3">
          <Link
            href="/"
            className="block text-center rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-100"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </aside>
  );
}
