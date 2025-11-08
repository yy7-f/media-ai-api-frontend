"use client";

import { useState } from "react";
import api from "@/lib/api";

type ApiResponse = {
  status?: string;
  result_path?: string;
  filename?: string;
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

const POS_OPTS = [
  "center",
  "top","bottom","left","right",
  "top-left","top-right","bottom-left","bottom-right",
];

export default function CropTool() {
  const [file, setFile] = useState<File | null>(null);

  // manual rect
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");

  // aspect mode fallback
  const [aspect, setAspect] = useState("9:16");
  const [mode, setMode] = useState("center");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isManual = x && y && w && h;

  async function handleSubmit() {
    if (!file) return;
    setError(null);
    setRes(null);
    setProgress(0);

    const form = new FormData();
    form.append("video", file);

    if (isManual) {
      form.append("x", x);
      form.append("y", y);
      form.append("width", w);
      form.append("height", h);
    } else {
      form.append("aspect", aspect);
      form.append("mode", mode);
    }

    try {
      setLoading(true);
      const r = await api.post("/video/crop/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setRes(r.data);
    } catch (e: any) {
      if (e.response) {
        setError(`HTTP ${e.response.status}: ${JSON.stringify(e.response.data)}`);
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

  function clearManual() {
    setX(""); setY(""); setW(""); setH("");
  }

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/video/crop</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Manual rectangle */}
          <div className="rounded border p-4">
            <div className="font-medium mb-2">Manual rectangle (x, y, w, h)</div>
            <div className="flex flex-wrap gap-2">
              <input
                placeholder="x"
                className="border px-2 py-1 rounded w-24"
                value={x}
                onChange={(e) => setX(e.target.value)}
              />
              <input
                placeholder="y"
                className="border px-2 py-1 rounded w-24"
                value={y}
                onChange={(e) => setY(e.target.value)}
              />
              <input
                placeholder="width"
                className="border px-2 py-1 rounded w-24"
                value={w}
                onChange={(e) => setW(e.target.value)}
              />
              <input
                placeholder="height"
                className="border px-2 py-1 rounded w-24"
                value={h}
                onChange={(e) => setH(e.target.value)}
              />
              <button
                type="button"
                onClick={clearManual}
                className="ml-2 text-sm px-3 py-1 rounded border"
              >
                Clear manual
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              If all four values are provided, manual crop is used. Otherwise, the aspect mode below will be used.
            </p>
          </div>

          {/* Aspect mode */}
          <div className="rounded border p-4">
            <div className="font-medium mb-2">Aspect mode (fallback)</div>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                className="border px-2 py-1 rounded w-32"
                value={aspect}
                onChange={(e) => setAspect(e.target.value)}
                placeholder="9:16, 16:9, 1:1..."
              />
              <select
                className="border px-2 py-1 rounded"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                {POS_OPTS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Used only when manual rectangle is not fully provided.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Crop"}
          </button>
          {loading && <div className="text-sm text-gray-600">Uploading… {progress}%</div>}
        </div>

        {error && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
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
