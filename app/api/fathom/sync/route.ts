import { NextResponse } from "next/server";
import {
  listMeetings,
  getTranscript,
  normalizeMeeting,
} from "@/lib/fathom";
import {
  readCsv,
  upsertRow,
  writeTranscript,
  getTranscriptPath,
} from "@/lib/storage/supabase";
import { CallRecord, TranscriptSegment } from "@/lib/storage/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const sinceIso = body.since_iso as string | undefined;

    const meetings = await listMeetings({
      since: sinceIso,
      limit: 50,
    });

    const syncedCalls: string[] = [];
    const errors: string[] = [];

    for (const meeting of meetings) {
      try {
        const normalized = normalizeMeeting(meeting);

        let transcriptSegments: TranscriptSegment[] = [];
        if (meeting.recording_id) {
          try {
            const rawTranscript = await getTranscript(meeting.recording_id);
            transcriptSegments = rawTranscript.map((seg) => ({
              speaker: seg.speaker,
              text: seg.text,
              start_time: seg.start_time,
              end_time: seg.end_time,
            }));
            writeTranscript(normalized.call_id, {
              call_id: normalized.call_id,
              segments: transcriptSegments,
            });
          } catch (e) {
            console.error(
              `Failed to fetch transcript for ${normalized.call_id}:`,
              e
            );
          }
        }

        const callRecord: CallRecord = {
          call_id: normalized.call_id,
          title: normalized.title,
          rep_id: normalized.rep_id,
          rep_name: normalized.rep_name,
          start_time_iso: normalized.start_time_iso,
          duration_sec: normalized.duration_sec,
          fathom_url: normalized.fathom_url,
          transcript_path: getTranscriptPath(normalized.call_id),
          synced_at_iso: new Date().toISOString(),
        };

        await upsertRow("calls.csv", "call_id", callRecord);
        syncedCalls.push(normalized.call_id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${meeting.id}: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCalls.length,
      call_ids: syncedCalls,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
