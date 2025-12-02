// src/app/tools/captions-burn/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

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

export default function CaptionsBurnTool() {
  const [video, setVideo] = useState<File | null>(null);
  const [subtitle, setSubtitle] = useState<File | null>(null); // .srt or .vtt

  // Options that map to backend fields
  const [fontSize, setFontSize] = useState("28");
  const [primaryHex, setPrimaryHex] = useState("FFFFFF"); // white
  const [outlineHex, setOutlineHex] = useState("000000"); // black outline
  const [outline, setOutline] = useState("2");
  const [yMargin, setYMargin] = useState("24");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function submit() {
    if (!video || !subtitle) return;
    if (!API_BASE) {
      setError("NEXT_PUBLIC_API_BASE is not configured.");
      return;
    }

    setError(null);
    setRes(null);
    setDownloadUrl(null);
    setProgress(0);

    const form = new FormData();
    form.append("video", video);
    form.append("subs", subtitle); // 👈 backend expects "subs"

    form.append("fontsize", fontSize);
    form.append("primary_hex", primaryHex);
    form.append("outline_hex", outlineHex);
    form.append("outline", outline);
    form.append("y_margin", yMargin);

    try {
      setLoading(true);
      const r = await api.post("/captions/burn", form, {
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
        setError("Captions burn succeeded, but no download URL was returned.");
      } else {
        setDownloadUrl(url);
      }
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
        <h2 className="text-xl font-semibold mb-3">/captions/burn</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3 rounded border p-4">
            <div>
              <span className="text-sm">Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <span className="text-sm">Subtitle (.srt/.vtt)</span>
              <input
                type="file"
                accept=".srt,.vtt"
                onChange={(e) => setSubtitle(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded border p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Font size</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm">Bottom margin (px)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={yMargin}
                  onChange={(e) => setYMargin(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Text color (hex)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={primaryHex}
                  onChange={(e) => setPrimaryHex(e.target.value)}
                  placeholder="FFFFFF"
                />
              </label>
              <label className="block">
                <span className="text-sm">Outline color (hex)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={outlineHex}
                  onChange={(e) => setOutlineHex(e.target.value)}
                  placeholder="000000"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm">Outline width</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!video || !subtitle || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Burn Captions"}
          </button>
          {loading && (
            <div className="text-sm text-gray-600">Uploading… {progress}%</div>
          )}
        </div>

        {error && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
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
              No downloadable URL was generated.
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
