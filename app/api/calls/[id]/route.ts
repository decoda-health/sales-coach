import { NextResponse } from "next/server";
import { readCsv, readTranscript } from "@/lib/storage/supabase";
import {
  CallRecord,
  CoachingRecord,
  Transcript,
  CoachingArtifact,
} from "@/lib/storage/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const calls = await readCsv<CallRecord>("calls.csv");
    const call = calls.find((c) => c.call_id === id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const transcriptData = await readTranscript(id);
    const transcript = transcriptData?.segments || [];

    const coachingRecords = await readCsv<CoachingRecord>("coaching.csv");
    const coachingRecord = coachingRecords.find((c) => c.call_id === id);

    let coaching: CoachingArtifact | null = null;
    if (coachingRecord) {
      coaching = {
        scores: JSON.parse(coachingRecord.scores_json || "{}"),
        strengths: JSON.parse(coachingRecord.strengths_json || "[]"),
        improvements: JSON.parse(coachingRecord.improvements_json || "[]"),
        objections: JSON.parse(coachingRecord.objections_json || "[]"),
        evidence: JSON.parse(coachingRecord.evidence_json || "[]"),
        summary: coachingRecord.coach_summary_md || "",
      };
    }

    return NextResponse.json({
      call_id: call.call_id,
      title: call.title,
      rep_id: call.rep_id,
      rep_name: call.rep_name,
      start_time_iso: call.start_time_iso,
      duration_sec: call.duration_sec,
      fathom_url: call.fathom_url,
      transcript,
      coaching,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load call";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
