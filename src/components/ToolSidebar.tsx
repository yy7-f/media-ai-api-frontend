"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOOLS: { href: string; label: string }[] = [
  { href: "/tools/video/trim",            label: "✂️ Trim" },
  { href: "/tools/video/crop",            label: "🖼️ Crop" },
  { href: "/tools/color",           label: "🎨 Color" },
  { href: "/tools/transcribe",      label: "🗣️ Transcribe" },
  { href: "/tools/overlay",         label: "📝 Text Overlay" },
  { href: "/tools/inpaint",         label: "🧠 Inpaint" },
  { href: "/tools/shuffle",         label: "🔀 Shuffle" },
  { href: "/tools/concat",          label: "➕ Concat" },
  { href: "/tools/captions-burn",   label: "💬 Captions Burn-in" },
  { href: "/tools/denoise",         label: "🔉 Audio Denoise" },
  { href: "/tools/jobs",            label: "📊 Jobs" },
  { href: "/tools/video/rotate", label: "Rotate" },
  { href: "/tools/video/speed",  label: "Speed"  },
  { href: "/tools/video/stabilize", label: "Stabilize (OpenCV)" },
    { href: "/tools/audio-normalize", label: "Audio Normalize" },
    { href: "/tools/audio-mix", label: "Audio Mix" },
];

export default function ToolSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="md:sticky md:top-4">
        <nav className="rounded-xl border bg-white p-3">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
            Tools
          </div>
          <ul className="mt-1">
            {TOOLS.map((t) => {
              const active = pathname === t.href;
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition
                      ${active
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Optional “Back to Home” */}
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
