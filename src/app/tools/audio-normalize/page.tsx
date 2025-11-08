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

export default function AudioNormalizePage() {
  const [media, setMedia] = useState<File | null>(null);

  // Typical EBU R128 / streaming defaults
  const [targetLufs, setTargetLufs] = useState("-14"); // Spotify/YouTube-ish
  const [truePeak, setTruePeak] = useState("-1.0");    // dBTP ceiling
  const [lra, setLra] = useState("11");                // loudness range target
  const [dualPass, setDualPass] = useState(true);      // ffmpeg loudnorm 2-pass
  const [mixToMono, setMixToMono] = useState(false);   // optional downmix
  const [sampleRate, setSampleRate] = useState("");    // e.g. "48000" (optional)
  const [channels, setChannels] = useState("");        // "1" | "2" (optional)

  const [crf, setCrf] = useState("18");                // if input is video
  const [preset, setPreset] = useState("veryfast");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!media) return;
    setErr(null);
    setRes(null);

    const form = new FormData();
    // Back-end: expect "media" (can be audio OR video)
    form.append("media", media);
    form.append("target_lufs", targetLufs);
    form.append("true_peak", truePeak);
    form.append("loudness_range", lra);
    form.append("dual_pass", String(dualPass));
    form.append("mix_to_mono", String(mixToMono));
    if (sampleRate) form.append("sample_rate", sampleRate);
    if (channels) form.append("channels", channels);
    // Only used when input is video; backend can ignore for audio-only
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
        <h2 className="text-xl font-semibold mb-3">/audio/normalize</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setMedia(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload audio or video. Output will match the backend’s format rules.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm">Target LUFS</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={targetLufs}
              onChange={(e) => setTargetLufs(e.target.value)}
              placeholder="-14"
            />
            <p className="text-xs text-gray-500 mt-1">Common values: -14 (music), -16 (podcast), -23 (broadcast).</p>
          </label>

          <label className="block">
            <span className="text-sm">True peak (dBTP)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={truePeak}
              onChange={(e) => setTruePeak(e.target.value)}
              placeholder="-1.0"
            />
          </label>

          <label className="block">
            <span className="text-sm">Loudness range (LRA)</span>
            <input
              className="mt-1 border px-2 py-1 rounded w-full"
              value={lra}
              onChange={(e) => setLra(e.target.value)}
              placeholder="11"
            />
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={dualPass}
              onChange={(e) => setDualPass(e.target.checked)}
            />
            <span className="text-sm">Dual-pass (more accurate)</span>
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
            <span className="text-sm">Sample rate (Hz, optional)</span>
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
              <span className="text-sm">Preset (video only)</span>
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
          {res.result_path ? (
            <a
              href={res.result_path}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Open result ({res.filename ?? "output"})
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
