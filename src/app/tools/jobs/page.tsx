"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

type JobStatus = "queued" | "running" | "done" | "error" | "canceled";

type JobPayload = {
  id: string;
  status: JobStatus;
  progress?: number;            // 0–100 (optional if your API provides)
  message?: string;             // error or info
  result_path?: string;         // e.g. output file url
  filename?: string;            // optional
  meta?: any;                   // optional extra data
  [k: string]: any;
};

function JobsPageContent() {
  const search = useSearchParams();
  const initialJobId = useMemo(() => search.get("job_id") || "", [search]);

  const [jobId, setJobId] = useState(initialJobId);
  const [job, setJob] = useState<JobPayload | null>(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intervalMs, setIntervalMs] = useState(1500);

  // Auto-start if job_id provided in URL
  useEffect(() => {
    if (initialJobId && !polling) {
      setPolling(true);
    }
  }, [initialJobId, polling]);

  useEffect(() => {
    if (!polling || !jobId) return;
    let cancelled = false;

    async function fetchOnce() {
      try {
        const r = await api.get(`/jobs/${encodeURIComponent(jobId)}`);
        if (cancelled) return;
        setJob(r.data);
        setError(null);

        // stop when terminal status reached
        const st = (r.data?.status || "").toLowerCase();
        if (["done", "error", "canceled"].includes(st)) {
          setPolling(false);
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(
          e?.response?.data?.message ||
            e?.message ||
            "Failed to fetch job",
        );
        // You can also stop on error if preferred:
        // setPolling(false);
      }
    }

    // immediate fetch, then interval
    fetchOnce();
    const id = setInterval(fetchOnce, Math.max(800, intervalMs));
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [polling, jobId, intervalMs]);

  function startPolling() {
    if (!jobId) return;
    setJob(null);
    setError(null);
    setPolling(true);
  }

  function stopPolling() {
    setPolling(false);
  }

  return (
    <main className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-3">/jobs — Status &amp; Results</h2>

        <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-2">
            <label className="block">
              <span className="text-sm">Job ID</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                placeholder="paste job id…"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm">Poll interval (ms)</span>
              <input
                className="mt-1 border px-2 py-1 rounded w-full"
                type="number"
                min={500}
                value={intervalMs}
                onChange={(e) =>
                  setIntervalMs(parseInt(e.target.value || "1500", 10))
                }
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startPolling}
              disabled={!jobId || polling}
              className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {polling ? "Polling…" : "Start polling"}
            </button>
            <button
              onClick={stopPolling}
              disabled={!polling}
              className="border px-4 py-2 rounded disabled:opacity-50"
            >
              Stop
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-red-600 text-sm">Error: {error}</p>
        )}
      </section>

      {job && (
        <section className="bg-white p-6 rounded-lg shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm">
              <span className="font-medium">Job:</span>{" "}
              <code>{job.id}</code>
            </div>
            <StatusPill status={job.status} />
            {typeof job.progress === "number" && (
              <div className="text-sm text-gray-600">
                Progress: {job.progress}%
              </div>
            )}
          </div>

          {job.message && (
            <p className="text-sm text-gray-700">Message: {job.message}</p>
          )}

          {job.result_path ? (
            <a
              href={job.result_path}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              Download result{" "}
              {job.filename ? `(${job.filename})` : ""}
            </a>
          ) : (
            <p className="text-sm text-gray-500">
              No <code>result_path</code> yet.
            </p>
          )}

          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-600">
              Raw payload
            </summary>
            <pre className="mt-2 text-xs bg-gray-50 p-3 overflow-auto max-h-80">
              {JSON.stringify(job, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}

function StatusPill({ status }: { status?: string }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "done"
      ? "bg-green-100 text-green-700"
      : s === "error"
      ? "bg-red-100 text-red-700"
      : s === "running"
      ? "bg-blue-100 text-blue-700"
      : s === "queued"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={`text-xs px-2 py-1 rounded ${cls}`}>
      {status || "unknown"}
    </span>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<main className="p-6">Loading jobs...</main>}>
      <JobsPageContent />
    </Suspense>
  );
}
