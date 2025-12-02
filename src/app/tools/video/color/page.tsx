"use client";

import { useState } from "react";
import api from "@/lib/api";

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  gcs_url?: string;          // ⭐ GCS URL from backend
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

const MODES = [
  "cinematic",
  "grayscale",
  "sepia",
  "bw_highcontrast",
  "brightness",
  "contrast",
  "saturation",
  "lut",
];

export default function ColorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState("cinematic");
  const [value, setValue] = useState("");              // for brightness/contrast/saturation
  const [lutPath, setLutPath] = useState("");          // server path for .cube (if mode=lut)
  const [targetRes, setTargetRes] = useState("");      // e.g. 1920x1080 or 1080x1920
  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");
  const [copyAudio, setCopyAudio] = useState(true);

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
    form.append("mode", mode);
    if (value) form.append("value", value);
    if (lutPath && mode === "lut") form.append("lut_path", lutPath);
    if (targetRes) form.append("target_resolution", targetRes);
    if (crf) form.append("crf", crf);
    if (preset) form.append("preset", preset);
    form.append("copy_audio", String(copyAudio));

    try {
      setLoading(true);
      const r = await api.post("/video/effects/color/", form, {
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
    (res?.gcs_url as string | undefined) ||
    (res?.result_path as string | undefined) ||
    "";

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/video/effects/color</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border p-4 space-y-3">
            <label className="block">
              <span className="text-sm">Mode</span>
              <select
                className="mt-1 border px-2 py-1 rounded w-full"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>

            {(mode === "brightness" ||
              mode === "contrast" ||
              mode === "saturation") && (
              <label className="block">
                <span className="text-sm">Value</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  placeholder="e.g. 0.1 for brightness, 1.2 for contrast"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </label>
            )}

            {mode === "lut" && (
              <label className="block">
                <span className="text-sm">LUT path (.cube on server)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  placeholder="/absolute/path/film_grade.cube"
                  value={lutPath}
                  onChange={(e) => setLutPath(e.target.value)}
                />
              </label>
            )}
          </div>

          <div className="rounded border p-4 space-y-3">
            <label className="block">
              <span className="text-sm">Target resolution (optional)</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                placeholder="WIDTHxHEIGHT (e.g., 1920x1080 or 1080x1920)"
                value={targetRes}
                onChange={(e) => setTargetRes(e.target.value)}
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

            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={copyAudio}
                onChange={(e) => setCopyAudio(e.target.checked)}
              />
              <span className="text-sm">Copy original audio</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Apply Color"}
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
