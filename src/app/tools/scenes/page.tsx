"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Scene = {
  index?: number;
  start?: number;          // seconds
  end?: number;            // seconds
  timecode_start?: string; // "HH:MM:SS.mmm"
  timecode_end?: string;
  thumb_path?: string;     // optional thumbnail url
  [k: string]: any;
};

type ApiRes = {
  status?: string;
  message?: string;
  scenes?: Scene[];
  // optional extras your backend might return:
  result_path?: string;    // e.g., CSV/EDL/JSON export
  edl_path?: string;
  csv_path?: string;
  json_path?: string;
  filename?: string;
  diagnostics?: any;
  [k: string]: any;
};

const METHODS = [
  // adjust to match your backend
  { value: "ffmpeg", label: "FFmpeg (ssim/scene)" },
  { value: "pyscenedetect", label: "PySceneDetect (content/adaptive)" },
];

export default function ScenesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [method, setMethod] = useState("ffmpeg");
  const [threshold, setThreshold] = useState("0.4");     // tune to your backend default
  const [minLen, setMinLen] = useState("0.5");           // seconds; avoid too-short scenes
  const [makeThumbs, setMakeThumbs] = useState(true);    // if backend can generate thumbnails
  const [maxThumbs, setMaxThumbs] = useState("100");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setErr(null);
    setRes(null);

    const form = new FormData();
    form.append("video", file);
    form.append("method", method);
    form.append("threshold", threshold);
    form.append("min_scene_len", minLen);
    form.append("thumbnails", String(makeThumbs));
    form.append("max_thumbs", maxThumbs);

    try {
      setLoading(true);
      const r = await api.post("/detect/scenes/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRes(r.data);
      toast.success("Scene detection complete");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Request failed";
      setErr(String(msg));
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  const scenes = res?.scenes ?? [];

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/detect/scenes</h2>

        <div className="mb-3">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Method</span>
            <select
              className="mt-1 border px-2 py-1 rounded w-full"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Threshold</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g. 0.4"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower = more cuts (method-specific).
            </p>
          </label>

          <label className="block">
            <span className="text-sm">Min scene length (s)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={minLen}
              onChange={(e) => setMinLen(e.target.value)}
              placeholder="e.g. 0.5"
            />
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={makeThumbs}
              onChange={(e) => setMakeThumbs(e.target.checked)}
            />
            <span className="text-sm">Generate thumbnails</span>
          </label>

          <label className="block">
            <span className="text-sm">Max thumbnails</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={maxThumbs}
              onChange={(e) => setMaxThumbs(e.target.value)}
              placeholder="e.g. 100"
            />
          </label>
        </div>

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Detect Scenes"}
          </button>
        </div>

        {err && <p className="mt-3 text-red-600 text-sm">Error: {err}</p>}
      </section>

      {/* Results */}
      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3 className="font-medium">Results</h3>

          {/* Download links if backend returns any */}
          <div className="flex flex-wrap gap-3">
            {res.result_path && (
              <a className="text-blue-600 underline" href={res.result_path} target="_blank" rel="noreferrer">
                Download results
              </a>
            )}
            {res.csv_path && (
              <a className="text-blue-600 underline" href={res.csv_path} target="_blank" rel="noreferrer">
                CSV
              </a>
            )}
            {res.edl_path && (
              <a className="text-blue-600 underline" href={res.edl_path} target="_blank" rel="noreferrer">
                EDL
              </a>
            )}
            {res.json_path && (
              <a className="text-blue-600 underline" href={res.json_path} target="_blank" rel="noreferrer">
                JSON
              </a>
            )}
          </div>

          {scenes.length ? (
            <>
              <table className="w-full text-sm border rounded overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">#</th>
                    <th className="text-left p-2 border-b">Start</th>
                    <th className="text-left p-2 border-b">End</th>
                    <th className="text-left p-2 border-b">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {scenes.map((s, i) => {
                    const start = s.timecode_start ?? (s.start != null ? secToTc(s.start) : "");
                    const end = s.timecode_end ?? (s.end != null ? secToTc(s.end) : "");
                    const dur =
                      s.start != null && s.end != null
                        ? (s.end - s.start).toFixed(3) + "s"
                        : "";
                    return (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2">{s.index ?? i + 1}</td>
                        <td className="p-2">{start}</td>
                        <td className="p-2">{end}</td>
                        <td className="p-2">{dur}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Thumbnails grid (optional) */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {scenes
                  .filter((s) => !!s.thumb_path)
                  .map((s, i) => (
                    <figure
                      key={`thumb-${i}`}
                      className="border rounded overflow-hidden bg-white"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={s.thumb_path!}
                        alt={`Scene ${s.index ?? i + 1}`}
                        className="w-full object-cover"
                      />
                      <figcaption className="text-xs p-2 text-gray-700">
                        #{s.index ?? i + 1} — {s.timecode_start ?? secToTc(s.start ?? 0)} →{" "}
                        {s.timecode_end ?? secToTc(s.end ?? 0)}
                      </figcaption>
                    </figure>
                  ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No scenes found.</p>
          )}

          {/* Raw payload for debugging */}
          <details>
            <summary className="cursor-pointer text-sm text-gray-600">
              Raw response
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 p-3 overflow-auto max-h-80">
              {JSON.stringify(res, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}

function secToTc(sec: number): string {
  const ms = Math.max(0, Math.round(sec * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const mm = ms % 1000;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}.${pad3(mm)}`;
}
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const pad3 = (n: number) => n.toString().padStart(3, "0");
