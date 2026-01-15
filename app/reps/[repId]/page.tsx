"use client";

import { useState, useEffect, use } from "react";

type TrendData = {
  skill_id: string;
  rolling_score_10: number;
  prev_rolling_score_10: number;
  trend_delta: number;
};

type RecentCoaching = {
  call_id: string;
  call_title: string;
  coached_at_iso: string;
  summary: string;
  scores: Record<string, number>;
};

type RepDetail = {
  rep_id: string;
  rep_name: string;
  trends: TrendData[];
  recent_coaching: RecentCoaching[];
};

export default function RepDetailPage({
  params,
}: {
  params: Promise<{ repId: string }>;
}) {
  const { repId } = use(params);
  const [rep, setRep] = useState<RepDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRep = async () => {
      try {
        const res = await fetch(`/api/reps/${repId}`);
        if (!res.ok) throw new Error("Failed to load rep");
        const data = await res.json();
        setRep(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    loadRep();
  }, [repId]);

  if (loading) {
    return <div className="text-gray-500">Loading rep...</div>;
  }

  if (error || !rep) {
    return <div className="text-red-600">{error || "Rep not found"}</div>;
  }

  const improvingSkills = rep.trends
    .filter((t) => t.trend_delta > 0)
    .sort((a, b) => b.trend_delta - a.trend_delta)
    .slice(0, 3);

  const decliningSkills = rep.trends
    .filter((t) => t.trend_delta < 0)
    .sort((a, b) => a.trend_delta - b.trend_delta)
    .slice(0, 3);

  const formatTrend = (delta: number) => {
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(2)}`;
  };

  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-blue-600 hover:underline text-sm">
          &larr; Back to calls
        </a>
        <h2 className="text-2xl font-bold mt-2">{rep.rep_name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Improving Skills */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            Top Improving Skills
          </h3>
          {improvingSkills.length === 0 ? (
            <div className="text-gray-500 text-sm">No improving trends yet</div>
          ) : (
            <div className="space-y-3">
              {improvingSkills.map((t) => (
                <div
                  key={t.skill_id}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700">{t.skill_id}</span>
                  <div className="text-right">
                    <span className="text-green-600 font-medium">
                      {formatTrend(t.trend_delta)}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({t.rolling_score_10.toFixed(1)}/5)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Declining Skills */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4 text-red-700">
            Skills Needing Focus
          </h3>
          {decliningSkills.length === 0 ? (
            <div className="text-gray-500 text-sm">No declining trends</div>
          ) : (
            <div className="space-y-3">
              {decliningSkills.map((t) => (
                <div
                  key={t.skill_id}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-700">{t.skill_id}</span>
                  <div className="text-right">
                    <span className="text-red-600 font-medium">
                      {formatTrend(t.trend_delta)}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({t.rolling_score_10.toFixed(1)}/5)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Skills */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h3 className="text-lg font-semibold mb-4">All Skills</h3>
        {rep.trends.length === 0 ? (
          <div className="text-gray-500 text-sm">No skill data yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rep.trends.map((t) => (
              <div
                key={t.skill_id}
                className="bg-gray-50 p-3 rounded flex items-center justify-between"
              >
                <span className="text-sm text-gray-700">{t.skill_id}</span>
                <div className="text-right">
                  <span className="font-medium">
                    {t.rolling_score_10.toFixed(1)}
                  </span>
                  <span
                    className={`text-xs ml-1 ${
                      t.trend_delta > 0
                        ? "text-green-600"
                        : t.trend_delta < 0
                        ? "text-red-600"
                        : "text-gray-400"
                    }`}
                  >
                    ({formatTrend(t.trend_delta)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Coaching */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Coaching</h3>
        {rep.recent_coaching.length === 0 ? (
          <div className="text-gray-500 text-sm">No coaching history yet</div>
        ) : (
          <div className="space-y-4">
            {rep.recent_coaching.map((c) => (
              <div key={c.call_id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-baseline justify-between mb-2">
                  <a
                    href={`/calls/${c.call_id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {c.call_title}
                  </a>
                  <span className="text-sm text-gray-400">
                    {new Date(c.coached_at_iso).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{c.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(c.scores).map(([skill, score]) => (
                    <span
                      key={skill}
                      className={`text-xs px-2 py-1 rounded ${
                        score >= 4
                          ? "bg-green-100 text-green-700"
                          : score >= 3
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {skill}: {score}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
