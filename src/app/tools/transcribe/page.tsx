"use client";

import { useState } from "react";
import api from "@/lib/api";

type TranscribeRes = {
  status?: string;
  json_path?: string;
  srt_path?: string;
  vtt_path?: string;
  diagnostics?: any;
  message?: string;
  [k: string]: any;
};

export default function TranscribeTool() {
  const [file, setFile] = useState<File | null>(null);
  const [model, setModel] = useState("base");     // tiny | base | small | medium | large-v3
  const [language, setLanguage] = useState("");   // e.g., "en", "ja" (optional)
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [res, setRes] = useState<TranscribeRes | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    setError(null);
    setRes(null);
    setProgress(0);

    const form = new FormData();
    form.append("media", file);                 // <— match your Flask parser arg
    form.append("model_size", model);
    if (language) form.append("language", language);

    try {
      setLoading(true);
      const r = await api.post("/transcribe/", form, {
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
        <h2 className="text-xl font-semibold mb-3">/transcribe</h2>

        <div className="mb-4">
          <input type="file" accept="audio/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Model size</span>
            <select
              className="mt-1 border px-2 py-1 rounded w-full"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {["tiny", "base", "small", "medium", "large-v3"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Language (optional)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              placeholder="en, ja, auto (leave blank)"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Transcribing..." : "Transcribe"}
          </button>
          {loading && <div className="text-sm text-gray-600">Uploading… {progress}%</div>}
        </div>

        {error && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm space-y-2">
          <h3 className="font-medium">Result</h3>

          <div className="space-y-1">
            {res.json_path && (
              <a className="text-blue-600 underline" href={res.json_path} target="_blank">JSON</a>
            )}
            {res.srt_path && (
              <div><a className="text-blue-600 underline" href={res.srt_path} target="_blank">SRT</a></div>
            )}
            {res.vtt_path && (
              <div><a className="text-blue-600 underline" href={res.vtt_path} target="_blank">VTT</a></div>
            )}
          </div>

          <pre className="mt-3 text-xs bg-gray-100 p-3 overflow-auto max-h-80">
            {JSON.stringify(res, null, 2)}
          </pre>
        </section>
      )}
    </main>
  );
}

