"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type ApiRes = {
  status?: string;
  result_path?: string;
  filename?: string;
  gcs_url?: string;         // ⭐ Enable GCS direct download
  message?: string;
  diagnostics?: any;
  [k: string]: any;
};

export default function AudioNormalizePage() {
  const [media, setMedia] = useState<File | null>(null);

  const [targetLufs, setTargetLufs] = useState("-14");
  const [truePeak, setTruePeak] = useState("-1.0");
  const [lra, setLra] = useState("11");
  const [dualPass, setDualPass] = useState(true);
  const [mixToMono, setMixToMono] = useState(false);
  const [sampleRate, setSampleRate] = useState("");
  const [channels, setChannels] = useState("");

  const [crf, setCrf] = useState("18");
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!media) return;
    setErr(null);
    setRes(null);

    const form = new FormData();
    form.append("media", media);
    form.append("target_i", targetLufs);
    form.append("target_tp", truePeak);
    form.append("target_lra", lra);
    form.append("dual_pass", String(dualPass));
    form.append("mix_to_mono", String(mixToMono));
    if (sampleRate) form.append("sample_rate", sampleRate);
    if (channels) form.append("channels", channels);
    form.append("crf", crf);
    form.append("preset", preset);

    try {
      setLoading(true);
      const r = await api.post("/audio/normalize/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRes(r.data);
      toast.success("Normalization complete");
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

  const downloadUrl =
    (res?.gcs_url as string | undefined) ||
    (res?.result_path as string | undefined) ||
    "";

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/audio/normalize</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload audio or video. Output follows backend rules.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Target LUFS</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={targetLufs}
              onChange={(e) => setTargetLufs(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">True Peak (dBTP)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={truePeak}
              onChange={(e) => setTruePeak(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm">Loudness Range (LRA)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={lra}
              onChange={(e) => setLra(e.target.value)}
            />
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={dualPass}
              onChange={(e) => setDualPass(e.target.checked)}
            />
            <span className="text-sm">Dual-pass</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={mixToMono}
              onChange={(e) => setMixToMono(e.target.checked)}
            />
            <span className="text-sm">Mix to mono</span>
          </label>

          <label className="block">
            <span className="text-sm">Sample Rate (optional)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              placeholder="48000"
            />
          </label>

          <label className="block">
            <span className="text-sm">Channels (optional)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
              placeholder="1 or 2"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">CRF (video only)</span>
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
            disabled={!media || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Normalizing..." : "Normalize"}
          </button>
        </div>

        {err && <p className="mt-3 text-red-600 text-sm">Error: {err}</p>}
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
              Open result ({res.filename ?? "output"})
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
