"use client";

import { useState, useEffect } from "react";
import { Users, Phone, TrendingUp, ChevronRight } from "lucide-react";

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

  if (loading) {
    return (
      <div className="animate-fade-in space-y-8">
        <div>
          <div className="h-10 w-48 shimmer rounded mb-2" />
          <div className="h-5 w-64 shimmer rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl h-[180px] shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="heading-display text-4xl text-foreground mb-2">
          Team Performance
        </h1>
        <p className="text-muted-foreground">
          Track coaching progress and skill development across your sales team
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Team</span>
          </div>
          <p className="heading-display text-3xl text-foreground">{reps.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Sales representatives</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.70_0.18_145_/_0.15)] flex items-center justify-center">
              <TrendingUp className="h-5 w-5 score-excellent" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Average</span>
          </div>
          <p className="heading-display text-3xl text-foreground">
            {reps.length > 0 && reps.some((r) => r.avg_score !== null)
              ? (
                  reps
                    .filter((r) => r.avg_score !== null)
                    .reduce((a, b) => a + (b.avg_score || 0), 0) /
                  reps.filter((r) => r.avg_score !== null).length
                ).toFixed(1)
              : "—"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Team coaching score</p>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Reps Grid */}
      {reps.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="heading-display text-2xl text-foreground mb-2">No team members yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sync calls from Fathom to see your team members and their coaching progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {reps.map((rep) => {
            const scoreColor = rep.avg_score !== null ? getScoreColor(rep.avg_score) : null;
            return (
              <a
                key={rep.rep_id}
                href={`/reps/${rep.rep_id}`}
                className="group glass-card rounded-xl p-5 transition-all duration-200 hover:bg-accent/50 hover:border-primary/20"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {getInitials(rep.rep_name)}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                  {rep.rep_name}
                </h3>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    {rep.call_count} call{rep.call_count !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Score Bar */}
                {rep.avg_score !== null && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-muted-foreground">Avg Score</span>
                      <span className={`text-sm font-medium ${scoreColor?.text}`}>
                        {rep.avg_score.toFixed(1)}/5
                      </span>
                    </div>
                    <div className="score-meter">
                      <div
                        className={`score-meter-fill ${scoreColor?.fill}`}
                        style={{ width: `${(rep.avg_score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {rep.avg_score === null && (
                  <div className="text-xs text-muted-foreground italic">
                    No coaching data yet
                  </div>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
