"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

const BORDER = [
  { v: "reflect", label: "Reflect" },
  { v: "replicate", label: "Replicate" },
  { v: "constant", label: "Constant (black)" },
  { v: "transparent", label: "Transparent (if supported)" },
];

export default function StabilizeCVPage() {
  const [file, setFile] = useState<File | null>(null);

  // Common OpenCV stabilization knobs (tweak to match your backend)
  const [smoothingRadius, setSmoothingRadius] = useState("30"); // frames for trajectory smoothing
  const [maxCorners, setMaxCorners] = useState("200");          // feature detection
  const [qualityLevel, setQualityLevel] = useState("0.01");     // 0–1
  const [minDistance, setMinDistance] = useState("30");         // pixels
  const [borderMode, setBorderMode] = useState("reflect");
  const [crop, setCrop] = useState(true);                       // crop to remove border wobble
  const [scale, setScale] = useState("1.0");                    // optional downscale for speed
  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setErr(null);
    setRes(null);

    const form = new FormData();
    form.append("video", file);
    form.append("smoothing_radius", smoothingRadius);
    form.append("max_corners", maxCorners);
    form.append("quality_level", qualityLevel);
    form.append("min_distance", minDistance);
    form.append("border_mode", borderMode);
    form.append("crop", String(crop));
    form.append("scale", scale);
    form.append("crf", crf);
    form.append("preset", preset);

    try {
      setLoading(true);
      // If your backend path is different, change it here:
      const r = await api.post("/video/stabilize/cv/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRes(r.data);
      toast.success("Stabilization complete");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Request failed";
      setErr(String(msg));
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/video/stabilize (OpenCV)</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Smoothing radius (frames)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={smoothingRadius}
              onChange={(e) => setSmoothingRadius(e.target.value)}
              placeholder="e.g. 30"
            />
          </label>

          <label className="block">
            <span className="text-sm">Max corners</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={maxCorners}
              onChange={(e) => setMaxCorners(e.target.value)}
              placeholder="e.g. 200"
            />
          </label>

          <label className="block">
            <span className="text-sm">Quality level (0–1)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={qualityLevel}
              onChange={(e) => setQualityLevel(e.target.value)}
              placeholder="0.01"
            />
          </label>

          <label className="block">
            <span className="text-sm">Min distance (px)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={minDistance}
              onChange={(e) => setMinDistance(e.target.value)}
              placeholder="30"
            />
          </label>

          <label className="block">
            <span className="text-sm">Border mode</span>
            <select
              className="mt-1 border px-2 py-1 rounded w-full"
              value={borderMode}
              onChange={(e) => setBorderMode(e.target.value)}
            >
              {BORDER.map((b) => (
                <option key={b.v} value={b.v}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={crop}
              onChange={(e) => setCrop(e.target.checked)}
            />
            <span className="text-sm">Crop borders</span>
          </label>

          <label className="block">
            <span className="text-sm">Process scale (1.0 = full)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              placeholder="e.g. 0.75"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower = faster but softer motion estimation.
            </p>
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

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Stabilizing..." : "Stabilize"}
          </button>
        </div>

        {err && <p className="mt-3 text-red-600 text-sm">Error: {err}</p>}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Result</h3>
          {res.result_path ? (
            <a
              href={res.result_path}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Open result ({res.filename ?? "output.mp4"})
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              No <code>result_path</code> returned.
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
