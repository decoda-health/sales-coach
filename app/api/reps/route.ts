import { NextResponse } from "next/server";
import { readCsv } from "@/lib/storage/csv";
import { CallRecord, CoachingRecord } from "@/lib/storage/schema";

export async function GET() {
  try {
    const calls = await readCsv<CallRecord>("calls.csv");
    const coaching = await readCsv<CoachingRecord>("coaching.csv");

    const repMap = new Map<
      string,
      { rep_id: string; rep_name: string; call_count: number; total_score: number; score_count: number }
    >();

    for (const call of calls) {
      const existing = repMap.get(call.rep_id);
      if (existing) {
        existing.call_count++;
      } else {
        repMap.set(call.rep_id, {
          rep_id: call.rep_id,
          rep_name: call.rep_name,
          call_count: 1,
          total_score: 0,
          score_count: 0,
        });
      }
    }

    for (const c of coaching) {
      const rep = repMap.get(c.rep_id);
      if (rep) {
        const scores = JSON.parse(c.scores_json || "{}");
        const scoreValues = Object.values(scores).filter(
          (v) => typeof v === "number"
        ) as number[];
        if (scoreValues.length > 0) {
          rep.total_score +=
            scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
          rep.score_count++;
        }
      }
    }

    const reps = Array.from(repMap.values()).map((r) => ({
      rep_id: r.rep_id,
      rep_name: r.rep_name,
      call_count: r.call_count,
      avg_score: r.score_count > 0 ? r.total_score / r.score_count : null,
    }));

    return NextResponse.json({ reps });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load reps";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
