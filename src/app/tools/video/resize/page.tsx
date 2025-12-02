// src/app/tools/video/resize/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  gcs_url?: string;
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

const PRESETS = [
  { value: "", label: "Custom (width/height)" },
  { value: "portrait_1080x1920", label: "Portrait 1080×1920" },
  { value: "landscape_1920x1080", label: "Landscape 1920×1080" },
  { value: "square_1080", label: "Square 1080×1080" },
];

export default function ResizeTool() {
  const [file, setFile] = useState<File | null>(null);

  const [mode, setMode] = useState<"pad" | "crop">("pad");
  const [preset, setPreset] = useState<string>("portrait_1080x1920");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [bgHex, setBgHex] = useState("000000");

  const [crf, setCrf] = useState("18");
  const [presetX264, setPresetX264] = useState("veryfast");
  const [fps, setFps] = useState("");
  const [copyAudio, setCopyAudio] = useState(true);
  const [bitrateAac, setBitrateAac] = useState("192k");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const useCustomSize = !preset; // if preset = "", allow width/height

  async function handleSubmit() {
    if (!file) return;
    if (!API_BASE) {
      setError("NEXT_PUBLIC_API_BASE is not configured.");
      return;
    }

    setError(null);
    setRes(null);
    setDownloadUrl(null);
    setProgress(0);

    const form = new FormData();
    form.append("video", file);
    form.append("mode", mode);

    if (preset) {
      form.append("preset", preset);
    }

    if (useCustomSize) {
      if (width) form.append("width", width);
      if (height) form.append("height", height);
    }

    if (bgHex) form.append("bg_hex", bgHex);
    if (crf) form.append("crf", crf);
    if (presetX264) form.append("preset_x264", presetX264);
    if (fps) form.append("fps", fps);
    form.append("copy_audio", String(copyAudio));
    if (bitrateAac) form.append("bitrate_aac", bitrateAac);

    try {
      setLoading(true);
      const r = await api.post("/edit/resize/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      const data: ApiRes = r.data;
      setRes(data);

      let url: string | null = null;

      // Prefer GCS URL if backend returned it
      if (data.gcs_url) {
        url = data.gcs_url as string;
      } else if (data.result_path && typeof data.result_path === "string") {
        // if backend ever returns a direct HTTP path
        if (data.result_path.startsWith("http")) {
          url = data.result_path;
        }
      }

      if (!url) {
        setError("Resize succeeded, but no download URL was returned.");
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
          setError(
            `HTTP ${status}: ${JSON.stringify(e.response.data)}`
          );
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
        <h2 className="text-xl font-semibold mb-3">/edit/resize</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: mode + size */}
          <div className="space-y-3 rounded border p-4">
            <label className="block">
              <span className="text-sm">Mode</span>
              <select
                className="mt-1 border px-2 py-1 rounded w-full"
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as "pad" | "crop")
                }
              >
                <option value="pad">pad (letterbox)</option>
                <option value="crop">crop (center-crop)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm">Preset</span>
              <select
                className="mt-1 border px-2 py-1 rounded w-full"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                {PRESETS.map((p) => (
                  <option key={p.value || "custom"} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Choose a preset, or select &quot;Custom&quot; and specify
                width/height.
              </p>
            </label>

            {useCustomSize && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm">Width</span>
                  <input
                    className="mt-1 border px-2 py-1 rounded w-full"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="e.g. 1080"
                  />
                </label>
                <label className="block">
                  <span className="text-sm">Height</span>
                  <input
                    className="mt-1 border px-2 py-1 rounded w-full"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 1920"
                  />
                </label>
              </div>
            )}

            <label className="block">
              <span className="text-sm">Background color (hex)</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={bgHex}
                onChange={(e) => setBgHex(e.target.value.toUpperCase())}
                placeholder="000000"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used for padding in pad mode.
              </p>
            </label>
          </div>

          {/* Right: encode options */}
          <div className="space-y-3 rounded border p-4">
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
                <span className="text-sm">x264 preset</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={presetX264}
                  onChange={(e) => setPresetX264(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm">Output FPS (optional)</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                placeholder="leave blank to keep original"
              />
            </label>

            <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
              <input
                id="copy-audio"
                type="checkbox"
                checked={copyAudio}
                onChange={(e) => setCopyAudio(e.target.checked)}
              />
              <label htmlFor="copy-audio" className="text-sm">
                Copy audio (otherwise re-encode AAC)
              </label>
            </div>

            <label className="block">
              <span className="text-sm">AAC bitrate</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={bitrateAac}
                onChange={(e) => setBitrateAac(e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Resize"}
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
