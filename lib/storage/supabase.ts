import { supabase } from "@/lib/supabase/client";
import type {
  CallRecord,
  CoachingRecord,
  RepLedgerRecord,
  Transcript,
} from "./schema";

// Map old CSV filenames to table names
type TableMap = {
  "calls.csv": "calls";
  "coaching.csv": "coaching";
  "rep_ledger.csv": "rep_ledger";
};

const tableMap: Record<string, string> = {
  "calls.csv": "calls",
  "coaching.csv": "coaching",
  "rep_ledger.csv": "rep_ledger",
};

export async function readCsv<T extends Record<string, unknown>>(
  filename: string
): Promise<T[]> {
  const table = tableMap[filename];
  if (!table) throw new Error(`Unknown table: ${filename}`);

  if (table === "calls") {
    const { data, error } = await supabase.from("calls").select("*");
    if (error) throw error;
    // Transform DB row to CallRecord format (add transcript_path)
    return (data || []).map((row) => ({
      call_id: row.call_id,
      title: row.title,
      rep_id: row.rep_id,
      rep_name: row.rep_name,
      start_time_iso: row.start_time_iso,
      duration_sec: row.duration_sec,
      fathom_url: row.fathom_url,
      synced_at_iso: row.synced_at_iso,
      transcript_path: getTranscriptPath(row.call_id),
    })) as unknown as T[];
  }

  if (table === "coaching") {
    const { data, error } = await supabase.from("coaching").select("*");
    if (error) throw error;
    // Transform DB row to CoachingRecord format (stringify JSON fields)
    return (data || []).map((row) => ({
      call_id: row.call_id,
      rep_id: row.rep_id,
      coached_at_iso: row.coached_at_iso,
      scores_json: JSON.stringify(row.scores),
      strengths_json: JSON.stringify(row.strengths),
      improvements_json: JSON.stringify(row.improvements),
      objections_json: JSON.stringify(row.objections),
      evidence_json: JSON.stringify(row.evidence),
      coach_summary_md: row.coach_summary_md,
      version: row.version,
    })) as unknown as T[];
  }

  if (table === "rep_ledger") {
    const { data, error } = await supabase.from("rep_ledger").select("*");
    if (error) throw error;
    return (data || []) as unknown as T[];
  }

  throw new Error(`Unsupported table: ${table}`);
}

export async function upsertRow<T extends Record<string, unknown>>(
  filename: string,
  keyField: keyof T,
  row: T
): Promise<void> {
  const table = tableMap[filename];
  if (!table) throw new Error(`Unknown table: ${filename}`);

  if (table === "calls") {
    const callRow = row as unknown as CallRecord;
    const { error } = await supabase.from("calls").upsert(
      {
        call_id: callRow.call_id,
        title: callRow.title,
        rep_id: callRow.rep_id,
        rep_name: callRow.rep_name,
        start_time_iso: callRow.start_time_iso,
        duration_sec: callRow.duration_sec,
        fathom_url: callRow.fathom_url,
        synced_at_iso: callRow.synced_at_iso,
      },
      { onConflict: "call_id" }
    );
    if (error) throw error;
    return;
  }

  if (table === "coaching") {
    const coachRow = row as unknown as CoachingRecord;
    const { error } = await supabase.from("coaching").upsert(
      {
        call_id: coachRow.call_id,
        rep_id: coachRow.rep_id,
        coached_at_iso: coachRow.coached_at_iso,
        scores: JSON.parse(coachRow.scores_json || "{}"),
        strengths: JSON.parse(coachRow.strengths_json || "[]"),
        improvements: JSON.parse(coachRow.improvements_json || "[]"),
        objections: JSON.parse(coachRow.objections_json || "[]"),
        evidence: JSON.parse(coachRow.evidence_json || "[]"),
        coach_summary_md: coachRow.coach_summary_md,
        version: coachRow.version,
      },
      { onConflict: "call_id" }
    );
    if (error) throw error;
    return;
  }

  throw new Error(`Unsupported table for upsertRow: ${table}`);
}

export async function upsertRowComposite<T extends Record<string, unknown>>(
  filename: string,
  keyFields: (keyof T)[],
  row: T
): Promise<void> {
  const table = tableMap[filename];
  if (!table) throw new Error(`Unknown table: ${filename}`);

  if (table === "rep_ledger") {
    const ledgerRow = row as unknown as RepLedgerRecord;
    const { error } = await supabase.from("rep_ledger").upsert(
      {
        rep_id: ledgerRow.rep_id,
        skill_id: ledgerRow.skill_id,
        rolling_score_10: ledgerRow.rolling_score_10,
        prev_rolling_score_10: ledgerRow.prev_rolling_score_10,
        trend_delta: ledgerRow.trend_delta,
        last_updated_iso: ledgerRow.last_updated_iso,
        open_focus_area: ledgerRow.open_focus_area,
      },
      { onConflict: "rep_id,skill_id" }
    );
    if (error) throw error;
    return;
  }

  throw new Error(`Unsupported table for upsertRowComposite: ${table}`);
}

const BUCKET_NAME = "transcripts";

export async function writeTranscript(
  callId: string,
  transcript: Transcript
): Promise<void> {
  const path = `${callId}.json`;
  const content = JSON.stringify(transcript, null, 2);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, content, {
      contentType: "application/json",
      upsert: true,
    });

  if (error) throw error;
}

export async function readTranscript(callId: string): Promise<Transcript | null> {
  const path = `${callId}.json`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path);

  if (error) {
    if (error.message.includes("not found") || error.message.includes("Object not found")) {
      return null;
    }
    throw error;
  }

  const text = await data.text();
  return JSON.parse(text) as Transcript;
}

export function getTranscriptPath(callId: string): string {
  return `${BUCKET_NAME}/${callId}.json`;
}

// Compatibility exports (unused but kept for interface parity)
export async function writeCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[]
): Promise<void> {
  throw new Error("writeCsv not supported with Supabase - use upsertRow instead");
}

export async function appendRow<T extends Record<string, unknown>>(
  filename: string,
  row: T
): Promise<void> {
  throw new Error("appendRow not supported with Supabase - use upsertRow instead");
}
