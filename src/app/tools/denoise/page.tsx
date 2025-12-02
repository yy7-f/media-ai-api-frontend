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

const METHODS = [
  "afftdn",   // FFmpeg frequency domain denoise
  "anlmdn",   // FFmpeg non-local means denoise
  "arnndn",   // FFmpeg RNNoise (needs model file on server)
];

export default function DenoiseTool() {
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState("afftdn");
  const [strength, setStrength] = useState("20"); // arbitrary; map to your backend param
  const [keepVideo, setKeepVideo] = useState(true); // if input is video, keep video with cleaned audio

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
    // backend can accept either audio or video; use a generic key
    form.append("media", file);
    form.append("method", method);
    form.append("strength", strength);
    form.append("keep_video", String(keepVideo));

    try {
      setLoading(true);
      const r = await api.post("/audio/denoise/", form, {
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
        <h2 className="text-xl font-semibold mb-3">/audio/denoise</h2>

        <div className="mb-4">
          <input type="file" accept="audio/*,video/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Method</span>
            <select className="mt-1 border px-2 py-1 rounded w-full" value={method} onChange={(e)=>setMethod(e.target.value)}>
              {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Strength</span>
            <input className="mt-1 border px-2 py-1 rounded w-full" value={strength} onChange={(e)=>setStrength(e.target.value)} />
          </label>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={keepVideo} onChange={(e)=>setKeepVideo(e.target.checked)} />
            <span className="text-sm">If input is video, return video with cleaned audio</span>
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={submit} disabled={!file || loading} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">
            {loading ? "Processing..." : "Denoise"}
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
              Open result ({res.filename ?? "output"})
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
