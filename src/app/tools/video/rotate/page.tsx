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

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  // Either use degrees OR a direction enum your backend accepts.
  // If your API uses direction only (clockwise/counterclockwise/transpose),
  // just hide the degrees input and send direction.
  const [degrees, setDegrees] = useState("90"); // 90 | 180 | 270
  const [direction, setDirection] = useState("clockwise"); // optional if your API uses it
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
    // send whichever your backend expects:
    form.append("degrees", degrees);
    form.append("direction", direction);
    form.append("crf", crf);
    form.append("preset", preset);

    try {
      setLoading(true);
      const r = await api.post("/video/rotate/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRes(r.data);
      toast.success("Rotate complete");
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
        <h2 className="text-xl font-semibold mb-3">/video/rotate</h2>

        <div className="mb-4">
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Degrees</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              placeholder="90 | 180 | 270"
              value={degrees}
              onChange={(e) => setDegrees(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">Direction (optional)</span>
            <select
              className="mt-1 border px-2 py-1 rounded w-full"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              {["clockwise", "counterclockwise", "transpose", "transverse"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">CRF</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={crf} onChange={(e)=>setCrf(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm">Preset</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={preset} onChange={(e)=>setPreset(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Rotate"}
          </button>
        </div>

        {err && <p className="mt-3 text-red-600 text-sm">Error: {err}</p>}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Result</h3>
          {res.result_path ? (
            <a href={res.result_path} className="text-blue-600 underline" target="_blank" rel="noreferrer">
              Open result ({res.filename ?? "output.mp4"})
            </a>
          ) : (
            <p className="text-sm text-gray-500">No <code>result_path</code> returned.</p>
          )}
          <pre className="mt-3 text-xs bg-gray-100 p-3 overflow-auto max-h-80">{JSON.stringify(res, null, 2)}</pre>
        </section>
      )}
    </main>
  );
}
