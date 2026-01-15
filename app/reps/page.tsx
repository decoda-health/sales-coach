"use client";

import { useState, useEffect } from "react";

type Rep = {
  rep_id: string;
  rep_name: string;
  call_count: number;
  avg_score: number | null;
};

export default function RepsPage() {
  const [reps, setReps] = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReps = async () => {
      try {
        const res = await fetch("/api/reps");
        if (!res.ok) throw new Error("Failed to load reps");
        const data = await res.json();
        setReps(data.reps || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadReps();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading reps...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sales Reps</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {reps.length === 0 ? (
        <div className="text-gray-500">
          No reps yet. Sync calls from Fathom to see reps.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reps.map((rep) => (
            <a
              key={rep.rep_id}
              href={`/reps/${rep.rep_id}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg">{rep.rep_name}</h3>
              <div className="mt-2 text-sm text-gray-600">
                <span>{rep.call_count} calls</span>
                {rep.avg_score !== null && (
                  <span className="ml-4">
                    Avg: {rep.avg_score.toFixed(1)}/5
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
