"use client";

import { useState } from "react";
import api from "@/lib/api";

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

const POSITIONS = ["bottom", "top", "center"];

export default function CaptionsBurnTool() {
  const [video, setVideo] = useState<File | null>(null);
  const [subtitle, setSubtitle] = useState<File | null>(null); // .srt or .vtt
  const [position, setPosition] = useState("bottom");
  const [fontSize, setFontSize] = useState("36");
  const [color, setColor] = useState("white");
  const [outline, setOutline] = useState("2"); // px (if backend supports)
  const [bgColor, setBgColor] = useState("");  // e.g. black@0.5 (optional)
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!video || !subtitle) return;
    setError(null);
    setRes(null);
    setProgress(0);

    const form = new FormData();
    form.append("video", video);
    // adjust the field name below to match your backend: "subtitle" | "srt" | "vtt"
    form.append("subtitle", subtitle);
    form.append("position", position);
    form.append("font_size", fontSize);
    form.append("color", color);
    form.append("outline", outline);
    if (bgColor) form.append("bg_color", bgColor);

    try {
      setLoading(true);
      const r = await api.post("/captions/burn/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setRes(r.data);
    } catch (e: any) {
      if (e.response) setError(`HTTP ${e.response.status}: ${JSON.stringify(e.response.data)}`);
      else if (e.request) setError(`No response: ${e.message}`);
      else setError(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/captions/burn</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 rounded border p-4">
            <div>
              <span className="text-sm">Video</span>
              <input type="file" accept="video/*" onChange={(e)=>setVideo(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <span className="text-sm">Subtitle (.srt/.vtt)</span>
              <input type="file" accept=".srt,.vtt" onChange={(e)=>setSubtitle(e.target.files?.[0] ?? null)} />
            </div>
          </div>

          <div className="space-y-3 rounded border p-4">
            <label className="block">
              <span className="text-sm">Position</span>
              <select className="mt-1 border px-2 py-1 rounded w-full" value={position} onChange={(e)=>setPosition(e.target.value)}>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Font size</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={fontSize} onChange={(e)=>setFontSize(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Outline (px)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={outline} onChange={(e)=>setOutline(e.target.value)} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Text color</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={color} onChange={(e)=>setColor(e.target.value)} placeholder="white / #ffcc00" />
              </label>
              <label className="block">
                <span className="text-sm">Background (optional)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={bgColor} onChange={(e)=>setBgColor(e.target.value)} placeholder="black@0.5" />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={submit} disabled={!video || !subtitle || loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? "Processing..." : "Burn Captions"}
          </button>
          {loading && <div className="text-sm text-gray-600">Uploading… {progress}%</div>}
        </div>

        {error && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Result</h3>
          {res.result_path ? (
            <a href={res.result_path} className="text-blue-600 underline" target="_blank" rel="noreferrer">
              Open result ({res.filename ?? "output.mp4"})
            </a>
          ) : (
            <p className="text-sm text-gray-500">No <code>result_path</code> returned.</p>
          )}
          <pre className="mt-3 text-xs bg-gray-100 p-3 overflow-auto max-h-80">
            {JSON.stringify(res, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
