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

export default function InpaintTool() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [file, setFile] = useState<File | null>(null);

  // Optional params for video inpaint if your backend supports (OCR langs, fps, device)
  const [ocrLangs, setOcrLangs] = useState("en"); // e.g., "en,ja"
  const [fps, setFps] = useState("30");
  const [device, setDevice] = useState("cpu");

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

    let url = "";
    if (mode === "image") {
      url = "/inpaint/image";
      form.append("image", file); // your image-only API; mask is auto-generated server-side
    } else {
      url = "/inpaint/video";
      form.append("video", file);
      // optional extras (only if your backend expects them):
      form.append("ocr_langs", ocrLangs);
      form.append("fps", fps);
      form.append("device", device);
    }

    try {
      setLoading(true);
      const r = await api.post(url, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setRes(r.data);
    } catch (e: any) {
      if (e.response) {
        const status = e.response.status;
        if (status === 401) {
          setError("Authentication required. Please log in to continue.");
          // Redirect to login page
          window.location.href = "/login";
          return;
        } else if (status === 403) {
          setError("Access denied. You don't have permission to perform this action.");
        } else {
          setError(`HTTP ${status}: ${JSON.stringify(e.response.data)}`);
        }
      } else if (e.request) {
        setError(`No response: ${e.message}`);
      } else {
        setError(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/inpaint — Image & Video</h2>

        <div className="mb-3">
          <label className="inline-flex items-center gap-2 mr-4">
            <input
              type="radio"
              name="mode"
              checked={mode === "image"}
              onChange={() => setMode("image")}
            />
            <span>Image inpaint (no mask)</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={mode === "video"}
              onChange={() => setMode("video")}
            />
            <span>Video inpaint (OCR + LaMa)</span>
          </label>
        </div>

        <div className="mb-4">
          <input
            type="file"
            accept={mode === "image" ? "image/*" : "video/*"}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {mode === "video" && (
          <div className="rounded border p-4 grid md:grid-cols-3 gap-3 mb-3">
            <label className="block">
              <span className="text-sm">OCR languages</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={ocrLangs} onChange={(e) => setOcrLangs(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">e.g. "en", or "en,ja"</p>
            </label>
            <label className="block">
              <span className="text-sm">FPS (reassemble)</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={fps} onChange={(e) => setFps(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm">Device</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={device} onChange={(e) => setDevice(e.target.value)} placeholder="cpu or cuda" />
            </label>
          </div>
        )}

        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Run Inpaint"}
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
              Open result ({res.filename ?? (mode === "image" ? "output.png" : "output.mp4")})
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
