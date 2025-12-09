// app/tools/video/trim/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export default function VideoTrimPage() {
  const { data: session, status } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [precise, setPrecise] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [backendResponse, setBackendResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const isAuthed = status === "authenticated";
  // Note: we no longer use session.accessToken for this endpoint

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDownloadUrl(null);
    setBackendResponse(null);

    if (!file) {
      setError("Please select a video file.");
      return;
    }

    if (!API_BASE) {
      setError("API base URL is not configured.");
      return;
    }

    if (!API_KEY) {
      setError("API key is not configured.");
      return;
    }

    try {
      setIsProcessing(true);

      const formData = new FormData();
      formData.append("video", file);
      if (start) formData.append("start", start);
      if (end) formData.append("end", end);
      formData.append("precise", precise ? "true" : "false");

      const res = await fetch(`${API_BASE}/video/trim/`, {
        method: "POST",
        headers: {
          // ✅ only API key; NO Content-Type for FormData
          "API-Key": API_KEY,
        },
        body: formData,
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // ignore JSON parse error; handled by status code below
      }
      setBackendResponse(data);

      if (!res.ok) {
        if (res.status === 401) {
          if (data?.error === "login_required") {
            setError(
              data?.message ||
                "This tool is only available after signing in. Please create an account or log in.",
            );
          } else {
            setError(data?.message || "Unauthorized access.");
          }
          return;
        }

        if (res.status === 403) {
          setError(
            data?.message ||
              "You’ve reached today’s free usage limit for this tool. Please try again tomorrow.",
          );
          return;
        }

        setError(data?.message || `Trim failed with status ${res.status}`);
        return;
      }

      const diagnostics = data?.diagnostics || {};
      const resultUrl: string | null =
        (diagnostics.gcs_url as string | null) ||
        (data?.gcs_uri as string | null) ||
        (data?.api_result_url ? `${API_BASE}${data.api_result_url}` : null);

      if (!resultUrl) {
        setError("Trim succeeded but no download URL was returned.");
        return;
      }

      setDownloadUrl(resultUrl);
    } catch (err) {
      console.error("Trim request error:", err);
      setError("Unexpected error while calling trim API.");
    } finally {
      setIsProcessing(false);
    }
  }

  if (status === "loading") {
    return <div className="text-sm text-gray-500">Checking your session…</div>;
  }

  if (!isAuthed) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Trim Video</h1>
        <p className="text-sm text-gray-600">
          You must be signed in to use this tool.
        </p>
        <a
          href="/login"
          className="inline-flex items-center rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
        >
          Go to Sign In
        </a>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Trim Video</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload a video and cut a section by start/end time. This will re-encode
          the output if <span className="font-mono">precise=true</span>.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File input */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Video file
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
              }}
              className="block w-full text-sm text-gray-700
                         file:mr-4 file:rounded-md file:border-0
                         file:bg-black file:px-3 file:py-1.5 file:text-sm
                         file:font-semibold file:text-white hover:file:bg-gray-900"
            />
          </div>

          {/* Timing options */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Start (seconds)
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                End (seconds)
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="e.g. 10"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Precise cut
              </label>
              <div className="flex items-center gap-2 text-sm">
                <input
                  id="precise"
                  type="checkbox"
                  checked={precise}
                  onChange={(e) => setPrecise(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="precise" className="text-gray-700">
                  Re-encode for frame-accuracy
                </label>
              </div>
            </div>
          </div>

          {/* Submit + status */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isProcessing || !file}
              className="inline-flex items-center rounded bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing…" : "Run Trim"}
            </button>

            {isProcessing && (
              <span className="text-xs text-gray-500">
                Processing on server…
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Result section */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-800">Result</h2>
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-700 space-y-2">
          {error && <p className="text-red-600 text-sm">Error: {error}</p>}

          {!error && !downloadUrl && !isProcessing && (
            <p className="text-xs text-gray-500">
              Run a trim job to see the result link here.
            </p>
          )}

          {downloadUrl && (
            <div className="space-y-2">
              <p>
                <span className="block text-xs text-gray-500">Output:</span>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 underline"
                >
                  Open result
                </a>
              </p>
              <video
                src={downloadUrl}
                controls
                className="mt-2 w-full max-w-xl rounded border"
              />
            </div>
          )}

          {backendResponse && (
            <details className="mt-2 text-xs text-gray-500">
              <summary className="cursor-pointer">Diagnostics (debug)</summary>
              <pre className="mt-1 whitespace-pre-wrap break-all">
                {JSON.stringify(backendResponse, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </section>
    </main>
  );
}
