// src/app/tools/video/speed/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  message?: string;
  diagnostics?: any;
  gcs_uri?: string;
  api_result_url?: string;
  [k: string]: any;
};

export default function SpeedTool() {
  const [file, setFile] = useState<File | null>(null);
  const [factor, setFactor] = useState("1.25");
  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function submit() {
    if (!file) return;
    if (!API_BASE) {
      setErr("NEXT_PUBLIC_API_BASE is not configured.");
      return;
    }

    setErr(null);
    setRes(null);
    setDownloadUrl(null);

    const form = new FormData();
    form.append("video", file);
    form.append("factor", factor);
    form.append("crf", crf);
    form.append("preset", preset);

    try {
      setLoading(true);
      const r = await api.post("/video/speed/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data: ApiRes = r.data;
      setRes(data);

      let url: string | null = null;
      if (data.gcs_uri) {
        url = data.gcs_uri;
      } else if (data.api_result_url) {
        url = `${API_BASE}${data.api_result_url}`;
      }

      if (!url) {
        setErr(
          "Speed change succeeded but no download URL was returned (no gcs_uri/api_result_url).",
        );
      } else {
        setDownloadUrl(url);
        toast.success("Speed change complete");
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
        <h2 className="text-xl font-semibold mb-3">/video/speed</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Factor</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              placeholder="e.g. 0.5 (slower), 2.0 (faster)"
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
            />
          </label>

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

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!file || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Change Speed"}
          </button>
        </div>

        {err && (
          <p className="mt-3 text-red-600 text-sm">Error: {err}</p>
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
              Speed change completed but no downloadable URL was generated.
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
