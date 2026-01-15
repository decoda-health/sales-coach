"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Phone,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";

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
  const [filterRep, setFilterRep] = useState("all");

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

  const filteredCalls =
    filterRep === "all" ? calls : calls.filter((c) => c.rep_id === filterRep);

  const uniqueReps = [...new Map(calls.map((c) => [c.rep_id, c])).values()];

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Stats
  const totalCalls = calls.length;
  const coachedCalls = calls.filter((c) => c.coached).length;
  const pendingCalls = totalCalls - coachedCalls;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="heading-display text-4xl text-foreground mb-2">
            Call Intelligence
          </h1>
          <p className="text-muted-foreground">
            Analyze and coach your team&apos;s sales conversations
          </p>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-primary/20"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync from Fathom"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          </div>
          <p className="heading-display text-3xl text-foreground">{totalCalls}</p>
          <p className="text-sm text-muted-foreground mt-1">Calls recorded</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.70_0.18_145_/_0.15)] flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 score-excellent" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Analyzed</span>
          </div>
          <p className="heading-display text-3xl text-foreground">{coachedCalls}</p>
          <p className="text-sm text-muted-foreground mt-1">Coaching complete</p>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[oklch(0.70_0.12_80_/_0.15)] flex items-center justify-center">
              <Sparkles className="h-5 w-5 score-average" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Pending</span>
          </div>
          <p className="heading-display text-3xl text-foreground">{pendingCalls}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting analysis</p>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-xl p-4 border-l-4 border-l-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Filter by rep:</span>
        </div>
        <Select value={filterRep} onValueChange={setFilterRep}>
          <SelectTrigger className="w-[200px] h-10 bg-card border-border/50 rounded-lg">
            <SelectValue placeholder="All team members" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border/50">
            <SelectItem value="all">All team members</SelectItem>
            {uniqueReps.map((r) => (
              <SelectItem key={r.rep_id} value={r.rep_id}>
                {r.rep_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Calls List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 shimmer rounded" />
                  <div className="h-3 w-1/4 shimmer rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <h3 className="heading-display text-2xl text-foreground mb-2">No calls yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Fathom account and sync your calls to start receiving AI-powered coaching insights.
          </p>
          <Button
            onClick={handleSync}
            disabled={syncing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            Sync from Fathom
          </Button>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {filteredCalls.map((call) => (
            <a
              key={call.call_id}
              href={`/calls/${call.call_id}`}
              className="group glass-card rounded-xl p-5 flex items-center gap-5 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:border-primary/20"
            >
              {/* Status Icon */}
              <div className={`
                w-11 h-11 rounded-lg flex items-center justify-center shrink-0
                ${call.coached
                  ? "bg-[oklch(0.70_0.18_145_/_0.15)]"
                  : "bg-muted"
                }
              `}>
                {call.coached ? (
                  <CheckCircle2 className="h-5 w-5 score-excellent" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* Call Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {call.title}
                  </h3>
                  {call.coached && (
                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium bg-[oklch(0.70_0.18_145_/_0.15)] score-excellent">
                      <TrendingUp className="h-3 w-3" />
                      Coached
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/reps/${call.rep_id}`;
                    }}
                    className="hover:text-primary cursor-pointer transition-colors"
                  >
                    {call.rep_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(call.duration_sec)}
                  </span>
                </div>
              </div>

              {/* Date & Arrow */}
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-sm text-muted-foreground">
                  {formatDate(call.start_time_iso)}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
