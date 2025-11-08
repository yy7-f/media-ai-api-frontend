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

const MIX_MODES = [
  { v: "straight", label: "Straight mix (no ducking)" },
  { v: "ducking", label: "Sidechain ducking (music ducks under voice)" },
];

export default function AudioMixPage() {
  const [voice, setVoice] = useState<File | null>(null);
  const [music, setMusic] = useState<File | null>(null);

  // Leveling
  const [voiceGain, setVoiceGain] = useState("0");   // dB
  const [musicGain, setMusicGain] = useState("-4");  // dB
  const [outGain, setOutGain] = useState("0");       // dB

  // Ducking (only applies in ducking mode)
  const [mode, setMode] = useState("ducking");
  const [duckAmount, setDuckAmount] = useState("-10");   // dB reduction on music
  const [attackMs, setAttackMs] = useState("80");        // ms
  const [releaseMs, setReleaseMs] = useState("300");     // ms
  const [thresholdDb, setThresholdDb] = useState("-20"); // dB trigger threshold (if your backend supports)

  // Optional time alignment
  const [voiceOffset, setVoiceOffset] = useState("0.0"); // seconds
  const [musicOffset, setMusicOffset] = useState("0.0"); // seconds

  // Output options (if your backend can also re-mux into video, ignore otherwise)
  const [sampleRate, setSampleRate] = useState("48000");
  const [channels, setChannels] = useState("2"); // 1 or 2

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ApiRes | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!voice || !music) {
      setErr("Please choose both voice and music files.");
      return;
    }
    setErr(null);
    setRes(null);

    const form = new FormData();
    // Adjust field names to match your backend if needed
    form.append("voice", voice);
    form.append("music", music);

    form.append("voice_gain_db", voiceGain);
    form.append("music_gain_db", musicGain);
    form.append("out_gain_db", outGain);

    form.append("mode", mode);                 // "straight" | "ducking"
    form.append("ducking_db", duckAmount);     // how much to duck music
    form.append("duck_attack_ms", attackMs);
    form.append("duck_release_ms", releaseMs);
    form.append("duck_threshold_db", thresholdDb);

    form.append("voice_offset_sec", voiceOffset);
    form.append("music_offset_sec", musicOffset);

    form.append("sample_rate", sampleRate);
    form.append("channels", channels);

    try {
      setLoading(true);
      const r = await api.post("/audio/mix/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRes(r.data);
      toast.success("Mix complete");
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
        <h2 className="text-xl font-semibold mb-3">/audio/mix</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded border p-4 space-y-3">
            <div>
              <span className="text-sm">Voice (dialogue, narration)</span>
              <input type="file" accept="audio/*" onChange={(e)=>setVoice(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <span className="text-sm">Music (background)</span>
              <input type="file" accept="audio/*" onChange={(e)=>setMusic(e.target.files?.[0] ?? null)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm">Voice gain (dB)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={voiceGain} onChange={(e)=>setVoiceGain(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Music gain (dB)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={musicGain} onChange={(e)=>setMusicGain(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Output gain (dB)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={outGain} onChange={(e)=>setOutGain(e.target.value)} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Voice offset (s)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={voiceOffset} onChange={(e)=>setVoiceOffset(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Music offset (s)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={musicOffset} onChange={(e)=>setMusicOffset(e.target.value)} />
              </label>
            </div>
          </div>

          <div className="rounded border p-4 space-y-3">
            <label className="block">
              <span className="text-sm">Mode</span>
              <select
                className="mt-1 border px-2 py-1 rounded w-full"
                value={mode}
                onChange={(e)=>setMode(e.target.value)}
              >
                {MIX_MODES.map(m => <option key={m.v} value={m.v}>{m.label}</option>)}
              </select>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm">Duck amount (dB)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={duckAmount} onChange={(e)=>setDuckAmount(e.target.value)} disabled={mode!=="ducking"} />
              </label>
              <label className="block">
                <span className="text-sm">Attack (ms)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={attackMs} onChange={(e)=>setAttackMs(e.target.value)} disabled={mode!=="ducking"} />
              </label>
              <label className="block">
                <span className="text-sm">Release (ms)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={releaseMs} onChange={(e)=>setReleaseMs(e.target.value)} disabled={mode!=="ducking"} />
              </label>
            </div>

            <label className="block">
              <span className="text-sm">Ducking threshold (dB)</span>
              <input className="mt-1 border px-2 py-1 rounded w-full" value={thresholdDb} onChange={(e)=>setThresholdDb(e.target.value)} disabled={mode!=="ducking"} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Sample rate (Hz)</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={sampleRate} onChange={(e)=>setSampleRate(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm">Channels</span>
                <input className="mt-1 border px-2 py-1 rounded w-full" value={channels} onChange={(e)=>setChannels(e.target.value)} />
              </label>
            </div>
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

        {err && <p className="mt-3 text-red-600 text-sm">Error: {err}</p>}
      </section>

      {res && (
        <section className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="font-medium mb-2">Result</h3>
          {res.result_path ? (
            <a href={res.result_path} className="text-blue-600 underline" target="_blank" rel="noreferrer">
              Open result ({res.filename ?? "mixed.wav"})
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
