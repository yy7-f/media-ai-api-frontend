"use client";

import { useState } from "react";
import api from "@/lib/api";

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

export default function ConcatTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [reencode, setReencode] = useState(true); // if your backend supports stream-copy vs re-encode
  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    setFiles(Array.from(list));
  }

  async function submit() {
    if (!files.length) return;
    setError(null);
    setRes(null);
    setProgress(0);

    const form = new FormData();
    files.forEach((f, idx) => form.append("videos", f, f.name)); // backend expects "videos"[] list
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
      setRes(r.data);
    } catch (e: any) {
      if (e.response) setError(`HTTP ${e.response.status}: ${JSON.stringify(e.response.data)}`);
      else if (e.request) setError(`No response: ${e.message}`);
      else setError(`Error: ${e.message}`);
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
          <p className="text-xs text-gray-500 mt-1">Order is as-selected. Ensure similar resolution/codec for best results.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={reencode} onChange={(e)=>setReencode(e.target.checked)} />
            <span className="text-sm">Re-encode (safer)</span>
          </label>
          <label className="block">
            <span className="text-sm">CRF</span>
            <input className="mt-1 border px-2 py-1 rounded w-full" value={crf} onChange={(e)=>setCrf(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm">Preset</span>
            <input className="mt-1 border px-2 py-1 rounded w-full" value={preset} onChange={(e)=>setPreset(e.target.value)} />
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
          {loading && <div className="text-sm text-gray-600">Uploading… {progress}%</div>}
        </div>

        {error && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
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
          <pre className="mt-3 text-xs bg-gray-100 p-3 overflow-auto max-h-80">
            {JSON.stringify(res, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}
