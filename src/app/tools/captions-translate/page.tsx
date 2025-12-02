"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type ApiRes = {
  status?: string;
  message?: string;
  filename?: string;
  result_path?: string; // translated subtitle url
  json_path?: string;   // optional
  diagnostics?: any;
  [k: string]: any;
};

const LANGS = [
  // ISO-639-1 (extend as you like)
  "en", "ja", "ko", "zh", "fr", "de", "es", "it", "pt", "ru", "id", "vi", "th"
];

const FORMATS = ["srt", "vtt"]; // align with your backend support

export default function CaptionsTranslatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState("en");
  const [source, setSource] = useState(""); // optional; empty = auto-detect (if backend supports)
  const [format, setFormat] = useState("srt");
  const [preserveTiming, setPreserveTiming] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [preview, setPreview] = useState<string>("");

  async function submit() {
    if (!file) {
      setErr("Please choose a .srt or .vtt file.");
      return;
    }
    setErr(null);
    setRes(null);
    setPreview("");

    const form = new FormData();
    // Adjust keys to match your backend:
    form.append("subtitle", file);           // or "file"
    if (source) form.append("source_lang", source);
    form.append("target_lang", target);
    form.append("format", format);           // "srt" | "vtt"
    form.append("preserve_timing", String(preserveTiming));

    try {
      setLoading(true);
      const r = await api.post("/captions/translate/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRes(r.data);
      toast.success("Translation complete");

      // Optional: fetch a short preview of the translated file (first ~3KB)
      if (r.data?.result_path) {
        try {
          const txt = await fetch(r.data.result_path).then((x) => x.text());
          setPreview(txt.slice(0, 3000));
        } catch {
          /* preview is optional */
        }
      }
    } catch (e: any) {
      if (e.response) {
        const status = e.response.status;
        if (status === 401) {
          setErr("Authentication required. Please log in to continue.");
          toast.error("Authentication required. Please log in to continue.");
          // Redirect to login page
          window.location.href = "/login";
          return;
        } else if (status === 403) {
          setErr("Access denied. You don't have permission to perform this action.");
          toast.error("Access denied. You don't have permission to perform this action.");
        } else {
          const msg = e?.response?.data?.message || `HTTP ${status}`;
          setErr(String(msg));
          toast.error(`Error: ${msg}`);
        }
      } else {
        const msg = e?.message || "Request failed";
        setErr(String(msg));
        toast.error(`Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/captions/translate</h2>

        <div className="mb-4">
          <input
            type="file"
            accept=".srt,.vtt"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a subtitle file (.srt or .vtt) to translate.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Target language</span>
            <select
              className="mt-1 border px-2 py-1 rounded w-full"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm">Source language (optional)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              placeholder="leave blank for auto"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">Output format</span>
            <select
              className="mt-1 border px-2 py-1 rounded w-full"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={preserveTiming}
              onChange={(e) => setPreserveTiming(e.target.checked)}
            />
            <span className="text-sm">Preserve original timing</span>
          </label>
        </div>

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>

        {err && <p className="mt-3 text-red-600 text-sm">Error: {err}</p>}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm space-y-3">
          <h3 className="font-medium">Result</h3>

          {res.result_path ? (
            <a
              href={res.result_path}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Download translated file ({res.filename ?? `${cryptoRandom(6)}.${format}`})
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              No <code>result_path</code> returned.
            </p>
          )}

          {preview && (
            <>
              <div className="text-sm text-gray-600">Preview (first ~3KB):</div>
              <pre className="text-xs bg-gray-50 p-3 overflow-auto max-h-80 whitespace-pre-wrap">
                {preview}
              </pre>
            </>
          )}

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

function cryptoRandom(len = 6) {
  // tiny helper to generate fallback filename suffix
  const bytes = new Uint8Array(len);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}
