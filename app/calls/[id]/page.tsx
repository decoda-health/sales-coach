"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelSelector } from "@/components/model-selector";
import {
  ArrowLeft,
  Play,
  ExternalLink,
  Clock,
  Calendar,
  User,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquareQuote,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

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
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-20250514");

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
        body: JSON.stringify({ call_id: id, model: selectedModel }),
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

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    return `${m} min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return { text: "score-excellent", bg: "bg-score-excellent", fill: "bg-[oklch(0.70_0.18_145)]" };
    if (score >= 3) return { text: "score-good", bg: "bg-score-good", fill: "bg-[oklch(0.75_0.15_60)]" };
    if (score >= 2) return { text: "score-average", bg: "bg-score-average", fill: "bg-[oklch(0.70_0.12_80)]" };
    return { text: "score-poor", bg: "bg-score-poor", fill: "bg-[oklch(0.65_0.18_25)]" };
  };

  const getAverageScore = (scores: Record<string, number>) => {
    const values = Object.values(scores);
    return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : "0";
  };

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-8 w-32 shimmer rounded" />
        <div className="h-10 w-2/3 shimmer rounded" />
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card rounded-xl h-[600px] shimmer" />
          <div className="glass-card rounded-xl h-[600px] shimmer" />
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="glass-card rounded-xl p-8 border-l-4 border-l-destructive animate-fade-in">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-destructive">{error || "Call not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <a
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </a>
        <h1 className="heading-display text-3xl text-foreground mb-3">
          {call.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a
            href={`/reps/${call.rep_id}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <User className="h-4 w-4" />
            {call.rep_name}
          </a>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date(call.start_time_iso).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDuration(call.duration_sec)}
          </span>
          {call.fathom_url && (
            <a
              href={call.fathom_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View in Fathom
            </a>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transcript Panel */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border/50">
            <h2 className="heading-display text-xl text-foreground">Transcript</h2>
          </div>
          <ScrollArea className="h-[600px]">
            {call.transcript.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <MessageSquareQuote className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No transcript available</p>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {call.transcript.map((seg, i) => {
                  const isRep = seg.speaker.toLowerCase().includes("rep") ||
                    seg.speaker.toLowerCase() === call.rep_name.toLowerCase();
                  return (
                    <div key={i} className="group">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-[11px] font-mono text-muted-foreground/60 w-10 shrink-0">
                          {formatTimestamp(seg.start_time)}
                        </span>
                        <span className={`text-sm font-medium ${isRep ? "speaker-rep" : "speaker-customer"}`}>
                          {seg.speaker}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-[52px] leading-relaxed">
                        {seg.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Coaching Panel */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <h2 className="heading-display text-xl text-foreground">AI Coaching</h2>
            {!call.coaching && (
              <div className="flex items-center gap-2">
                <ModelSelector
                  value={selectedModel}
                  onChange={setSelectedModel}
                  disabled={coaching}
                />
                <Button
                  onClick={handleRunCoach}
                  disabled={coaching}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 rounded-lg font-medium"
                >
                  <Sparkles className={`mr-2 h-4 w-4 ${coaching ? "animate-pulse" : ""}`} />
                  {coaching ? "Analyzing..." : "Run Analysis"}
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="m-5 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {!call.coaching ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="heading-display text-xl text-foreground mb-2">
                Ready for Analysis
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                Click &quot;Run Analysis&quot; to generate AI-powered coaching insights for this call.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[550px]">
              <div className="p-5 space-y-6">
                {/* Overall Score */}
                <div className="glass-card rounded-xl p-5 glow-border">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground uppercase tracking-wider">Overall Score</span>
                    <div className="flex items-center gap-2">
                      <span className="heading-display text-3xl text-primary">
                        {getAverageScore(call.coaching.scores)}
                      </span>
                      <span className="text-muted-foreground">/5</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {call.coaching.summary}
                  </p>
                </div>

                {/* Skills Breakdown */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Skills Assessment
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(call.coaching.scores).map(([skill, score]) => {
                      const colors = getScoreColor(score);
                      return (
                        <div key={skill} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-muted-foreground">{skill}</span>
                            <span className={`text-sm font-medium ${colors.text}`}>
                              {score}/5
                            </span>
                          </div>
                          <div className="score-meter">
                            <div
                              className={`score-meter-fill ${colors.fill}`}
                              style={{ width: `${(score / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 score-excellent" />
                    Strengths
                  </h3>
                  <div className="space-y-2">
                    {call.coaching.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-score-excellent">
                        <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.70_0.18_145)] mt-2 shrink-0" />
                        <p className="text-sm text-foreground">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Areas to Improve
                  </h3>
                  <div className="space-y-2">
                    {call.coaching.improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-sm text-foreground">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Objections */}
                {call.coaching.objections.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 score-average" />
                      Objection Handling
                    </h3>
                    <div className="space-y-3">
                      {call.coaching.objections.map((obj, i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                          <p className="text-sm font-medium text-foreground mb-2">
                            &ldquo;{obj.objection}&rdquo;
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {obj.handling}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Clips */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <MessageSquareQuote className="h-4 w-4 text-primary" />
                    Key Moments
                  </h3>
                  <div className="space-y-3">
                    {call.coaching.evidence.map((ev, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg bg-primary/5 border-l-2 border-l-primary"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-primary uppercase tracking-wider">
                            {ev.skill}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            @{formatTimestamp(ev.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm italic text-foreground mb-2">
                          &ldquo;{ev.quote}&rdquo;
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ev.assessment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
