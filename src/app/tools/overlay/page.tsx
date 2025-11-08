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

export default function OverlayTool() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("Hello World");
  const [x, setX] = useState("50");            // pixels from left
  const [y, setY] = useState("100");           // pixels from top
  const [fontSize, setFontSize] = useState("48");
  const [color, setColor] = useState("white"); // e.g. white, black, yellow, #ffcc00
  const [start, setStart] = useState("0");     // seconds
  const [end, setEnd] = useState("");          // blank = full duration
  const [bgColor, setBgColor] = useState("");  // optional background box color (e.g. black@0.5)
  const [alignment, setAlignment] = useState("left"); // left|center|right (if your API supports)

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setError(null);
    setRes(null);
    setProgress(0);

    const form = new FormData();
    form.append("video", file);
    form.append("text", text);
    form.append("x", x);
    form.append("y", y);
    form.append("font_size", fontSize);
    form.append("color", color);
    if (bgColor) form.append("bg_color", bgColor);
    form.append("alignment", alignment);
    form.append("start", start);
    if (end) form.append("end", end);

    try {
      setLoading(true);
      const r = await api.post("/overlay/text/", form, {
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
        <h2 className="text-xl font-semibold mb-3">/overlay/text</h2>

        <div className="mb-4">
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border p-4 space-y-3">
            <label className="block">
              <span className="text-sm">Text</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">X (px)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={x} onChange={(e) => setX(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Y (px)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={y} onChange={(e) => setY(e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Font size</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={fontSize} onChange={(e) => setFontSize(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Color</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={color} onChange={(e) => setColor(e.target.value)} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm">Background (optional)</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" placeholder="e.g. black@0.5" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm">Alignment</span>
              <select className="mt-1 border px-2 py-1 rounded w-full" value={alignment} onChange={(e) => setAlignment(e.target.value)}>
                {["left","center","right"].map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <div className="rounded border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Start time (s)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={start} onChange={(e) => setStart(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">End time (s, optional)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="leave blank for full duration" />
              </label>
            </div>
            <p className="text-xs text-gray-500">Times are in seconds; end is optional.</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={submit} disabled={!file || loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? "Processing..." : "Add Text Overlay"}
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
