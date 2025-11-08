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

const POSITIONS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "center",
];

export default function WatermarkTool() {
  const [video, setVideo] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null); // PNG recommended
  const [position, setPosition] = useState("top-right");
  const [opacity, setOpacity] = useState("0.8"); // 0.0–1.0
  const [scale, setScale] = useState("0.15"); // fraction of video width/height
  const [marginX, setMarginX] = useState("24"); // px
  const [marginY, setMarginY] = useState("24"); // px
  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!video || !image) {
      setErr("Please select both a video and a watermark image.");
      return;
    }
    setErr(null);
    setRes(null);

    const form = new FormData();
    // adjust keys below if your backend expects different names
    form.append("video", video);
    form.append("image", image); // some backends use "watermark" or "watermark_image"
    form.append("position", position);
    form.append("opacity", opacity);
    form.append("scale", scale);
    form.append("margin_x", marginX);
    form.append("margin_y", marginY);
    form.append("crf", crf);
    form.append("preset", preset);

    try {
      setLoading(true);
      const r = await api.post("/video/watermark/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRes(r.data);
      toast.success("Watermark applied");
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
        <h2 className="text-xl font-semibold mb-3">/video/watermark</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border p-4 space-y-3">
            <div>
              <span className="text-sm">Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <span className="text-sm">Watermark image (PNG recommended)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
            </div>
            <label className="block">
              <span className="text-sm">Position</span>
              <select
                className="mt-1 border px-2 py-1 rounded w-full"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Opacity (0–1)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm">Scale (fraction, e.g. 0.15)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Margin X (px)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={marginX}
                  onChange={(e) => setMarginX(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm">Margin Y (px)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={marginY}
                  onChange={(e) => setMarginY(e.target.value)}
                />
              </label>
            </div>

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
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!video || !image || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Apply Watermark"}
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
