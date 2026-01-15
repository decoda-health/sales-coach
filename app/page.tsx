"use client";

import { useState, useEffect } from "react";

type Call = {
  call_id: string;
  title: string;
  rep_id: string;
  rep_name: string;
  start_time_iso: string;
  duration_sec: number;
  fathom_url: string;
  coached: boolean;
};

export default function Dashboard() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRep, setFilterRep] = useState("");

  const loadCalls = async () => {
    try {
      const res = await fetch("/api/calls");
      if (!res.ok) throw new Error("Failed to load calls");
      const data = await res.json();
      setCalls(data.calls || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch("/api/fathom/sync", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Sync failed");
      }
      await loadCalls();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const filteredCalls = filterRep
    ? calls.filter((c) => c.rep_id === filterRep)
    : calls;

  const uniqueReps = [...new Map(calls.map((c) => [c.rep_id, c])).values()];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Calls</h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? "Syncing..." : "Sync from Fathom"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <div className="mb-4">
        <select
          value={filterRep}
          onChange={(e) => setFilterRep(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Reps</option>
          {uniqueReps.map((r) => (
            <option key={r.rep_id} value={r.rep_id}>
              {r.rep_name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading calls...</div>
      ) : filteredCalls.length === 0 ? (
        <div className="text-gray-500">
          No calls yet. Click &quot;Sync from Fathom&quot; to import.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Rep
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCalls.map((call) => (
                <tr
                  key={call.call_id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/calls/${call.call_id}`)
                  }
                >
                  <td className="px-4 py-3 text-sm">
                    {formatDate(call.start_time_iso)}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {call.title}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={`/reps/${call.rep_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-600 hover:underline"
                    >
                      {call.rep_name}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDuration(call.duration_sec)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {call.coached ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        Coached
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
