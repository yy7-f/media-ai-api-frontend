// app/tools/page.tsx
"use client";

import Link from "next/link";
import { TOOLS, CATEGORY_ORDER, Tool } from "@/config/tools";

export default function ToolsIndexPage() {
  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">All Tools</h1>
        <p className="text-gray-600 text-sm">
          Click a tool to open it. Items marked{" "}
          <span className="font-semibold">Coming Soon</span> are on the roadmap.
        </p>
      </header>

      {CATEGORY_ORDER.map((category) => {
        const toolsInCategory = TOOLS.filter(
          (t) => t.category === category
        );
        if (!toolsInCategory.length) return null;

        return (
          <section key={category} className="space-y-3">
            <h2 className="text-lg font-semibold">{category} Tools</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {toolsInCategory.map((tool) => {
                const isLive = tool.status === "live";

                const card = (
                  <div
                    className={[
                      "h-full rounded-lg border p-4 flex flex-col justify-between transition",
                      isLive
                        ? "bg-white hover:shadow-md hover:border-gray-300"
                        : "bg-gray-50 border-dashed border-gray-300",
                    ].join(" ")}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base">
                          {tool.name}
                        </h3>
                        <span
                          className={[
                            "text-[11px] uppercase tracking-wide rounded-full px-2 py-0.5",
                            isLive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-600",
                          ].join(" ")}
                        >
                          {isLive ? "Live" : "Coming Soon"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {tool.short}
                      </p>
                    </div>

                    <div className="mt-3">
                      {isLive ? (
                        <span className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600">
                          Open tool →
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs sm:text-sm text-gray-400">
                          Not available yet
                        </span>
                      )}
                    </div>
                  </div>
                );

                if (!isLive) {
                  return (
                    <div key={tool.id} className="cursor-not-allowed">
                      {card}
                    </div>
                  );
                }

                return (
                  <Link key={tool.id} href={tool.slug} className="block">
                    {card}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
