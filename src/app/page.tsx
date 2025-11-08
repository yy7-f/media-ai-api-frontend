import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎬 AI Media Tools Dashboard
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Upload your media files and apply video/audio/image processing directly from the browser.
          <br />
          (Powered by your Flask backend APIs)
        </p>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { href: "/tools/video/trim", label: "✂️ Trim Video" },
            { href: "/tools/video/crop", label: "🖼️ Crop Video" },
            { href: "/tools/color", label: "🎨 Color Grading" },
            { href: "/tools/transcribe", label: "🗣️ Transcribe Audio/Video" },
            { href: "/tools/overlay", label: "📝 Text Overlay" },
            { href: "/tools/inpaint", label: "🧠 Inpaint Image/Video" },
            { href: "/tools/shuffle", label: "🔀 Shuffle Video" },
            { href: "/tools/concat",  label: "➕ Concat Videos" },
            { href: "/tools/captions-burn", label: "💬 Captions Burn-in" },
            { href: "/tools/denoise",       label: "🔉 Audio Denoise" },
            { href: "/tools/scenes", label: "Detect Scenes" },
            { href: "/tools/captions-translate", label: "Captions Translate" },

          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="block rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition p-5 text-left"
            >
              <div className="text-xl font-semibold mb-2">{tool.label}</div>
              <div className="text-sm text-gray-500 break-all">
                {tool.href}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-sm text-gray-500">
          Backend: <code>Flask API (http://127.0.0.1:5071/api/v1)</code>
          <br />
          Frontend: <code>Next.js + Tailwind + React Query</code>
        </div>
      </div>
    </main>
  );
}
