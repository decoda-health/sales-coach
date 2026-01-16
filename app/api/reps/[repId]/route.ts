import { NextResponse } from "next/server";
import { readCsv } from "@/lib/storage/supabase";
import {
  CallRecord,
  CoachingRecord,
  RepLedgerRecord,
} from "@/lib/storage/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ repId: string }> }
) {
  try {
    const { repId } = await params;

    const calls = await readCsv<CallRecord>("calls.csv");
    const repCalls = calls.filter((c) => c.rep_id === repId);

    if (repCalls.length === 0) {
      return NextResponse.json({ error: "Rep not found" }, { status: 404 });
    }

    const repName = repCalls[0].rep_name;

    const ledger = await readCsv<RepLedgerRecord>("rep_ledger.csv");
    const trends = ledger.filter((r) => r.rep_id === repId);

    const coaching = await readCsv<CoachingRecord>("coaching.csv");
    const repCoaching = coaching
      .filter((c) => c.rep_id === repId)
      .sort(
        (a, b) =>
          new Date(b.coached_at_iso).getTime() -
          new Date(a.coached_at_iso).getTime()
      )
      .slice(0, 10);

    const recentCoaching = repCoaching.map((c) => {
      const call = repCalls.find((call) => call.call_id === c.call_id);
      return {
        call_id: c.call_id,
        call_title: call?.title || "Unknown Call",
        coached_at_iso: c.coached_at_iso,
        summary: c.coach_summary_md,
        scores: JSON.parse(c.scores_json || "{}"),
      };
    });

    return NextResponse.json({
      rep_id: repId,
      rep_name: repName,
      trends,
      recent_coaching: recentCoaching,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load rep";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
