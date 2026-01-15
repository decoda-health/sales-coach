import { NextResponse } from "next/server";
import { readCsv, readTranscript, appendRow } from "@/lib/storage/csv";
import {
  CallRecord,
  CoachingRecord,
  Transcript,
  COACHING_VERSION,
} from "@/lib/storage/schema";
import { generateCoachingArtifact } from "@/lib/coach/coach";
import { updateRepLedger } from "@/lib/trends/ledger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const callId = body.call_id as string;

    if (!callId) {
      return NextResponse.json(
        { error: "call_id is required" },
        { status: 400 }
      );
    }

    const calls = await readCsv<CallRecord>("calls.csv");
    const call = calls.find((c) => c.call_id === callId);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const transcriptData = readTranscript(callId) as Transcript | null;
    if (!transcriptData || transcriptData.segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript available for this call" },
        { status: 400 }
      );
    }

    const artifact = await generateCoachingArtifact(transcriptData.segments, {
      title: call.title,
      rep_name: call.rep_name,
      duration_sec: call.duration_sec,
    });

    const coachingRecord: CoachingRecord = {
      call_id: callId,
      rep_id: call.rep_id,
      coached_at_iso: new Date().toISOString(),
      scores_json: JSON.stringify(artifact.scores),
      strengths_json: JSON.stringify(artifact.strengths),
      improvements_json: JSON.stringify(artifact.improvements),
      objections_json: JSON.stringify(artifact.objections),
      evidence_json: JSON.stringify(artifact.evidence),
      coach_summary_md: artifact.summary,
      version: COACHING_VERSION,
    };

    await appendRow("coaching.csv", coachingRecord);

    await updateRepLedger(call.rep_id, artifact.scores);

    return NextResponse.json({
      success: true,
      coaching: artifact,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Coaching failed";
    console.error("Coaching error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
