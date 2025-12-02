// src/app/tools/audio/mix/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");

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

const MIX_MODES = [
  { v: "straight", label: "Straight mix (no ducking)" },
  { v: "ducking", label: "Sidechain ducking (music ducks under voice)" },
];

export default function AudioMixPage() {
  const [voice, setVoice] = useState<File | null>(null);
  const [music, setMusic] = useState<File | null>(null);

  const [musicGain, setMusicGain] = useState("-12"); // maps to bgm_db
  const [outGain, setOutGain] = useState("0");       // master_db

  const [mode, setMode] = useState("ducking");
  const [duckAmount, setDuckAmount] = useState("8");     // ratio (approx)
  const [attackMs, setAttackMs] = useState("10");
  const [releaseMs, setReleaseMs] = useState("250");
  const [thresholdDb, setThresholdDb] = useState("-30");

  const [musicOffset, setMusicOffset] = useState("0.0");

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function submit() {
    if (!voice || !music) {
      setErr("Please choose both main (voice/video) and BGM files.");
      return;
    }
    if (!API_BASE) {
      setErr("NEXT_PUBLIC_API_BASE is not configured.");
      return;
    }

    setErr(null);
    setRes(null);
    setDownloadUrl(null);

    const form = new FormData();

    // 🔹 match backend field names
    form.append("main", voice);
    form.append("bgm", music);

    // Levels
    form.append("bgm_db", musicGain);
    form.append("master_db", outGain);

    // Ducking
    form.append("ducking", mode === "ducking" ? "true" : "false");
    form.append("duck_threshold_db", thresholdDb);
    form.append("duck_ratio", duckAmount);      // simplified
    form.append("duck_attack_ms", attackMs);
    form.append("duck_release_ms", releaseMs);

    // Timing
    form.append("bgm_offset_s", musicOffset);
    form.append("loop_bgm", "true");

    // AAC bitrate for video outputs (if applicable)
    form.append("aac_bitrate", "192k");

    try {
      setLoading(true);
      const r = await api.post("/audio/mix/", form, {
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
          "Mix succeeded but no download URL was returned (no gcs_uri/api_result_url).",
        );
      } else {
        setDownloadUrl(url);
        toast.success("Mix complete");
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
        <h2 className="text-xl font-semibold mb-3">/audio/mix</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border p-4 space-y-3">
            <div>
              <span className="text-sm block mb-1">Main (voice/video)</span>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={(e) => setVoice(e.target.files?.[0] ?? null)}
              />
            </div>
            <div>
              <span className="text-sm block mb-1">BGM (music)</span>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setMusic(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">BGM gain (dB)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={musicGain}
                  onChange={(e) => setMusicGain(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-sm">Master gain (dB)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={outGain}
                  onChange={(e) => setOutGain(e.target.value)}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm">BGM offset (s)</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={musicOffset}
                onChange={(e) => setMusicOffset(e.target.value)}
              />
            </label>
          </div>

          <div className="rounded border p-4 space-y-3">
            <label className="block">
              <span className="text-sm">Mode</span>
              <select
                className="mt-1 border px-2 py-1 rounded w-full"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                {MIX_MODES.map((m) => (
                  <option key={m.v} value={m.v}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm">Duck ratio</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={duckAmount}
                  onChange={(e) => setDuckAmount(e.target.value)}
                  disabled={mode !== "ducking"}
                />
              </label>
              <label className="block">
                <span className="text-sm">Attack (ms)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={attackMs}
                  onChange={(e) => setAttackMs(e.target.value)}
                  disabled={mode !== "ducking"}
                />
              </label>
              <label className="block">
                <span className="text-sm">Release (ms)</span>
                <input
                  className="mt-1 border px-2 py-1 rounded w-full"
                  value={releaseMs}
                  onChange={(e) => setReleaseMs(e.target.value)}
                  disabled={mode !== "ducking"}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm">Threshold (dB)</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                value={thresholdDb}
                onChange={(e) => setThresholdDb(e.target.value)}
                disabled={mode !== "ducking"}
              />
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={submit}
            disabled={!voice || !music || loading}
            className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Mixing..." : "Mix"}
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
              Open result ({res.filename ?? "mixed.wav"})
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              Mix completed but no downloadable URL was generated.
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
