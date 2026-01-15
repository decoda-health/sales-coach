"use client";

import { useState, useEffect, use } from "react";

type TranscriptSegment = {
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
};

type Evidence = {
  timestamp: number;
  quote: string;
  skill: string;
  assessment: string;
};

type CoachingArtifact = {
  scores: Record<string, number>;
  strengths: string[];
  improvements: string[];
  objections: Array<{ objection: string; handling: string }>;
  evidence: Evidence[];
  summary: string;
};

type CallDetail = {
  call_id: string;
  title: string;
  rep_id: string;
  rep_name: string;
  start_time_iso: string;
  duration_sec: number;
  fathom_url: string;
  transcript: TranscriptSegment[];
  coaching: CoachingArtifact | null;
};

export default function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [call, setCall] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coaching, setCoaching] = useState(false);

  useEffect(() => {
    const loadCall = async () => {
      try {
        const res = await fetch(`/api/calls/${id}`);
        if (!res.ok) throw new Error("Failed to load call");
        const data = await res.json();
        setCall(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadCall();
  }, [id]);

  const handleRunCoach = async () => {
    setCoaching(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_id: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Coaching failed");
      }
      const data = await res.json();
      setCall((prev) => (prev ? { ...prev, coaching: data.coaching } : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Coaching failed");
    } finally {
      setCoaching(false);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="text-gray-500">Loading call...</div>;
  }

  if (error || !call) {
    return (
      <div className="text-red-600">{error || "Call not found"}</div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-blue-600 hover:underline text-sm">
          &larr; Back to calls
        </a>
        <h2 className="text-2xl font-bold mt-2">{call.title}</h2>
        <div className="text-gray-500 text-sm">
          <a
            href={`/reps/${call.rep_id}`}
            className="text-blue-600 hover:underline"
          >
            {call.rep_name}
          </a>{" "}
          &middot; {new Date(call.start_time_iso).toLocaleString()}
          {call.fathom_url && (
            <>
              {" "}
              &middot;{" "}
              <a
                href={call.fathom_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View in Fathom
              </a>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Transcript</h3>
          <div className="max-h-[600px] overflow-y-auto space-y-3">
            {call.transcript.length === 0 ? (
              <div className="text-gray-500">No transcript available</div>
            ) : (
              call.transcript.map((seg, i) => (
                <div key={i} className="text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-400 text-xs">
                      {formatTimestamp(seg.start_time)}
                    </span>
                    <span className="font-medium text-gray-700">
                      {seg.speaker}
                    </span>
                  </div>
                  <p className="text-gray-600 ml-12">{seg.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coaching */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Coaching</h3>
            {!call.coaching && (
              <button
                onClick={handleRunCoach}
                disabled={coaching}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {coaching ? "Analyzing..." : "Run Coach"}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {!call.coaching ? (
            <div className="text-gray-500 text-sm">
              No coaching analysis yet. Click &quot;Run Coach&quot; to analyze
              this call.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                <p className="text-sm text-gray-600">{call.coaching.summary}</p>
              </div>

              {/* Scores */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Scores</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(call.coaching.scores).map(([skill, score]) => (
                    <div
                      key={skill}
                      className="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded"
                    >
                      <span className="text-gray-600">{skill}</span>
                      <span
                        className={`font-medium ${
                          score >= 4
                            ? "text-green-600"
                            : score >= 3
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {score}/5
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Strengths</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {call.coaching.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Areas for Improvement
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {call.coaching.improvements.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Objections */}
              {call.coaching.objections.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Objection Handling
                  </h4>
                  <div className="space-y-2">
                    {call.coaching.objections.map((obj, i) => (
                      <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                        <div className="font-medium text-gray-700">
                          {obj.objection}
                        </div>
                        <div className="text-gray-600">{obj.handling}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Evidence Clips
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {call.coaching.evidence.map((ev, i) => (
                    <div
                      key={i}
                      className="bg-blue-50 p-3 rounded text-sm border-l-4 border-blue-400"
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-medium text-blue-700">
                          {ev.skill}
                        </span>
                        <span className="text-blue-500 text-xs">
                          @{formatTimestamp(ev.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 italic mb-1">
                        &ldquo;{ev.quote}&rdquo;
                      </p>
                      <p className="text-gray-600 text-xs">{ev.assessment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
