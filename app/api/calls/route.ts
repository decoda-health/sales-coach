import { NextResponse } from "next/server";
import { readCsv } from "@/lib/storage/csv";
import { CallRecord, CoachingRecord } from "@/lib/storage/schema";

export async function GET() {
  try {
    const calls = await readCsv<CallRecord>("calls.csv");
    const coaching = await readCsv<CoachingRecord>("coaching.csv");

    const coachedCallIds = new Set(coaching.map((c) => c.call_id));

    const callsWithStatus = calls
      .map((call) => ({
        call_id: call.call_id,
        title: call.title,
        rep_id: call.rep_id,
        rep_name: call.rep_name,
        start_time_iso: call.start_time_iso,
        duration_sec: call.duration_sec,
        fathom_url: call.fathom_url,
        coached: coachedCallIds.has(call.call_id),
      }))
      .sort(
        (a, b) =>
          new Date(b.start_time_iso).getTime() -
          new Date(a.start_time_iso).getTime()
      );

    return NextResponse.json({ calls: callsWithStatus });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load calls";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
