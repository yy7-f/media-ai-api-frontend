// src/app/tools/video/concat/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  message?: string;
  diagnostics?: any;
  gcs_uri?: string;
  api_result_url?: string;
  [k: string]: any;
};

export default function ConcatTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [reencode, setReencode] = useState(true);
  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;

    const picked = Array.from(list);

    // append new selections (avoid duplicates by name/size/mtime)
    setFiles((prev) => {
      const existingKeys = new Set(
        prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      );
      const merged = [...prev];
      for (const f of picked) {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (!existingKeys.has(key)) merged.push(f);
      }
      return merged;
    });

    // allow selecting same file again later
    e.target.value = "";
  }

  async function submit() {
    if (!files.length) {
      setError("Please choose at least two video files.");
      return;
    }
    if (files.length < 2) {
      setError("Please choose at least two video files to concat.");
      return;
    }
    if (!API_BASE) {
      setError("NEXT_PUBLIC_API_BASE is not configured.");
      return;
    }

    setError(null);
    setRes(null);
    setDownloadUrl(null);
    setProgress(0);

    const form = new FormData();
    files.forEach((f) => form.append("videos", f, f.name));
    form.append("reencode", String(reencode));
    if (crf) form.append("crf", crf);
    if (preset) form.append("preset", preset);

    try {
      setLoading(true);
      const r = await api.post("/video/concat/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      const data: ApiRes = r.data;
      setRes(data);

      let url: string | null = null;
      if (data.gcs_uri) {
        url = data.gcs_uri;
      } else if (data.api_result_url) {
        url = `${API_BASE}${data.api_result_url}`;
      }

      if (!url) {
        setError(
          "Concat succeeded but no download URL was returned (no gcs_uri/api_result_url).",
        );
      } else {
        setDownloadUrl(url);
      }
    } catch (e: any) {
      if (e.response) {
        const status = e.response.status;
        if (status === 401) {
          setError("Authentication required. Please log in to continue.");
          window.location.href = "/login";
          return;
        } else if (status === 403) {
          setError("Access denied. You don't have permission to perform this action.");
        } else {
          setError(`HTTP ${status}: ${JSON.stringify(e.response.data)}`);
        }
      } else if (e.request) {
        setError(`No response: ${e.message}`);
        console.error("No response", e.request);
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
        <h2 className="text-xl font-semibold mb-3">/video/concat</h2>

        <div className="mb-3">
          <input type="file" accept="video/*" multiple onChange={onPick} />
          <p className="text-xs text-gray-500 mt-1">
            Order is as-selected / appended. Ensure similar resolution/codec for best
            results.
          </p>

          {files.length > 0 && (
            <div className="mt-2 text-xs text-gray-700">
              <div className="flex items-center justify-between mb-1">
                <span>Selected files ({files.length}):</span>
                <button
                  type="button"
                  className="text-[11px] text-red-600 underline"
                  onClick={() => setFiles([])}
                >
                  Clear
                </button>
              </div>
              <ul className="list-disc ml-5 space-y-0.5">
                {files.map((f, i) => (
                  <li key={`${f.name}-${f.lastModified}-${i}`}>{f.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={reencode}
              onChange={(e) => setReencode(e.target.checked)}
            />
            <span className="text-sm">Re-encode (safer)</span>
          </label>
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

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!files.length || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Concat"}
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
              Concat completed but no downloadable URL was generated.
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
