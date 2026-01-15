"use client";

import { useState, useEffect, use } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Phone,
  Calendar,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

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

  const getScoreColor = (score: number) => {
    if (score >= 4) return { text: "score-excellent", fill: "bg-[oklch(0.70_0.18_145)]" };
    if (score >= 3) return { text: "score-good", fill: "bg-[oklch(0.75_0.15_60)]" };
    if (score >= 2) return { text: "score-average", fill: "bg-[oklch(0.70_0.12_80)]" };
    return { text: "score-poor", fill: "bg-[oklch(0.65_0.18_25)]" };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTrend = (delta: number) => {
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(2)}`;
  };

  const TrendIndicator = ({ delta }: { delta: number }) => {
    if (delta > 0.1) {
      return (
        <div className="flex items-center gap-1 text-xs font-medium score-excellent">
          <TrendingUp className="h-3.5 w-3.5" />
          {formatTrend(delta)}
        </div>
      );
    }
    if (delta < -0.1) {
      return (
        <div className="flex items-center gap-1 text-xs font-medium score-poor">
          <TrendingDown className="h-3.5 w-3.5" />
          {formatTrend(delta)}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
        {formatTrend(delta)}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-32 shimmer rounded" />
        <div className="h-10 w-48 shimmer rounded" />
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card rounded-xl h-[300px] shimmer" />
          <div className="glass-card rounded-xl h-[300px] shimmer" />
        </div>
      </div>
    );
  }

  if (error || !rep) {
    return (
      <div className="glass-card rounded-xl p-8 border-l-4 border-l-destructive animate-fade-in">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error || "Rep not found"}</p>
        </div>
      </div>
    );
  }

  const improvingSkills = rep.trends
    .filter((t) => t.trend_delta > 0.1)
    .sort((a, b) => b.trend_delta - a.trend_delta)
    .slice(0, 3);

  const decliningSkills = rep.trends
    .filter((t) => t.trend_delta < -0.1)
    .sort((a, b) => a.trend_delta - b.trend_delta)
    .slice(0, 3);

  const avgScore = rep.trends.length
    ? (rep.trends.reduce((a, b) => a + b.rolling_score_10, 0) / rep.trends.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <a
          href="/reps"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Team
        </a>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center glow-border">
            <span className="text-lg font-medium text-primary">
              {getInitials(rep.rep_name)}
            </span>
          </div>
          <div>
            <h1 className="heading-display text-3xl text-foreground">
              {rep.rep_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {rep.recent_coaching.length} coaching session{rep.recent_coaching.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Trend Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Improving Skills */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.70_0.18_145_/_0.15)] flex items-center justify-center">
              <TrendingUp className="h-4 w-4 score-excellent" />
            </div>
            <h2 className="font-medium text-foreground">Top Improving</h2>
          </div>
          {improvingSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No improving trends detected yet
            </p>
          ) : (
            <div className="space-y-3">
              {improvingSkills.map((t) => {
                const colors = getScoreColor(t.rolling_score_10);
                return (
                  <div key={t.skill_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{t.skill_id}</span>
                      <div className="flex items-center gap-3">
                        <TrendIndicator delta={t.trend_delta} />
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {t.rolling_score_10.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="score-meter">
                      <div
                        className={`score-meter-fill ${colors.fill}`}
                        style={{ width: `${(t.rolling_score_10 / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Needs Focus */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[oklch(0.65_0.18_25_/_0.15)] flex items-center justify-center">
              <TrendingDown className="h-4 w-4 score-poor" />
            </div>
            <h2 className="font-medium text-foreground">Needs Focus</h2>
          </div>
          {decliningSkills.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No declining trends detected
            </p>
          ) : (
            <div className="space-y-3">
              {decliningSkills.map((t) => {
                const colors = getScoreColor(t.rolling_score_10);
                return (
                  <div key={t.skill_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-foreground">{t.skill_id}</span>
                      <div className="flex items-center gap-3">
                        <TrendIndicator delta={t.trend_delta} />
                        <span className={`text-sm font-medium ${colors.text}`}>
                          {t.rolling_score_10.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="score-meter">
                      <div
                        className={`score-meter-fill ${colors.fill}`}
                        style={{ width: `${(t.rolling_score_10 / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* All Skills */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-medium text-foreground">Skills Overview</h2>
          {avgScore && (
            <span className="ml-auto text-sm text-muted-foreground">
              Average: <span className="font-medium text-foreground">{avgScore}/5</span>
            </span>
          )}
        </div>
        {rep.trends.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No skill data available yet. Run coaching on some calls to see trends.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rep.trends.map((t) => {
              const colors = getScoreColor(t.rolling_score_10);
              return (
                <div key={t.skill_id} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{t.skill_id}</span>
                    <div className="flex items-center gap-2">
                      <TrendIndicator delta={t.trend_delta} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 score-meter">
                      <div
                        className={`score-meter-fill ${colors.fill}`}
                        style={{ width: `${(t.rolling_score_10 / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium min-w-[40px] text-right ${colors.text}`}>
                      {t.rolling_score_10.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Coaching */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-medium text-foreground">Recent Coaching Sessions</h2>
          </div>
        </div>
        {rep.recent_coaching.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No coaching history yet. Run coaching on calls to see history.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-border/50">
              {rep.recent_coaching.map((c) => {
                const avgCallScore = Object.values(c.scores).length
                  ? (Object.values(c.scores).reduce((a, b) => a + b, 0) / Object.values(c.scores).length)
                  : null;
                const scoreColor = avgCallScore !== null ? getScoreColor(avgCallScore) : null;

                return (
                  <a
                    key={c.call_id}
                    href={`/calls/${c.call_id}`}
                    className="group flex items-start gap-4 p-5 hover:bg-accent/30 transition-colors"
                  >
                    {/* Score Badge */}
                    {avgCallScore !== null && (
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${scoreColor?.fill}/20`}>
                        <span className={`text-lg font-medium ${scoreColor?.text}`}>
                          {avgCallScore.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {c.call_title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(c.coached_at_iso).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {c.summary}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </a>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
