"use client";

import { useState } from "react";
import api from "@/lib/api";

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  gcs_url?: string;
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

export default function ShuffleTool() {
  const [file, setFile] = useState<File | null>(null);
  const [chunkSec, setChunkSec] = useState("2"); // default chunk length (sec)
  const [seed, setSeed] = useState("");          // optional seed for reproducibility
  const [crf, setCrf] = useState("18");          // (only if backend supports)
  const [preset, setPreset] = useState("veryfast");

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
    if (chunkSec) form.append("chunk_sec", chunkSec);
    if (seed) form.append("seed", seed);
    // only send these if your backend supports them:
    // if (crf) form.append("crf", crf);
    // if (preset) form.append("preset", preset);

    try {
      setLoading(true);
      const r = await api.post("/shuffle/", form, {   // 👈 match Flask path
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

  const downloadUrl =
    (res?.gcs_url as string | undefined) || (res?.result_path as string | undefined) || "";

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/video/shuffle</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Chunk seconds</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={chunkSec}
              onChange={(e) => setChunkSec(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm">Seed (optional)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">CRF</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={crf}
                onChange={(e) => setCrf(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm">Preset</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Shuffle"}
          </button>
          {loading && (
            <div className="text-sm text-gray-600">
              Uploading… {progress}%
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-red-600 text-sm">Error: {error}</p>
        )}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Result</h3>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Open result ({res.filename ?? "output.mp4"})
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              No <code>gcs_url</code> or <code>result_path</code> returned.
            </p>
          )}
          <pre className="mt-3 text-xs bg-gray-100 p-3 overflow-auto max-h-80">
            {JSON.stringify(res, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
