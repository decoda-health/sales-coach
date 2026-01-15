const FATHOM_API_BASE = "https://api.fathom.video/v1";

type FathomMeeting = {
  id: string;
  title: string;
  created_at: string;
  duration: number;
  recording_id: string | null;
  participants: Array<{
    id: string;
    name: string;
    email: string;
    is_host: boolean;
  }>;
  external_url?: string;
};

type FathomTranscriptSegment = {
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
};

type FathomRecording = {
  id: string;
  meeting_id: string;
  duration: number;
  created_at: string;
  transcript_available: boolean;
};

function getApiKey(): string {
  const key = process.env.FATHOM_API_KEY;
  if (!key) {
    throw new Error("FATHOM_API_KEY environment variable is not set");
  }
  return key;
}

async function fathomFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${FATHOM_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fathom API error ${res.status}: ${text}`);
  }
  return res.json();
}

export type ListMeetingsOptions = {
  since?: string;
  limit?: number;
};

export async function listMeetings(
  options: ListMeetingsOptions = {}
): Promise<FathomMeeting[]> {
  const params = new URLSearchParams();
  if (options.limit) {
    params.set("limit", String(options.limit));
  }
  if (options.since) {
    params.set("created_after", options.since);
  }
  const query = params.toString() ? `?${params}` : "";
  const response = await fathomFetch<{ meetings: FathomMeeting[] }>(
    `/meetings${query}`
  );
  return response.meetings || [];
}

export async function getMeeting(meetingId: string): Promise<FathomMeeting> {
  return fathomFetch<FathomMeeting>(`/meetings/${meetingId}`);
}

export async function listRecordings(meetingId: string): Promise<FathomRecording[]> {
  const response = await fathomFetch<{ recordings: FathomRecording[] }>(
    `/meetings/${meetingId}/recordings`
  );
  return response.recordings || [];
}

export async function getTranscript(
  recordingId: string
): Promise<FathomTranscriptSegment[]> {
  const response = await fathomFetch<{ transcript: FathomTranscriptSegment[] }>(
    `/recordings/${recordingId}/transcript`
  );
  return response.transcript || [];
}

export type NormalizedCall = {
  call_id: string;
  title: string;
  rep_id: string;
  rep_name: string;
  start_time_iso: string;
  duration_sec: number;
  fathom_url: string;
  recording_id: string | null;
};

export function normalizeMeeting(meeting: FathomMeeting): NormalizedCall {
  const host = meeting.participants.find((p) => p.is_host) ||
    meeting.participants[0] || { id: "unknown", name: "Unknown" };

  return {
    call_id: meeting.id,
    title: meeting.title || "Untitled Call",
    rep_id: host.id || "unknown",
    rep_name: host.name || "Unknown",
    start_time_iso: meeting.created_at,
    duration_sec: meeting.duration || 0,
    fathom_url: meeting.external_url || "",
    recording_id: meeting.recording_id,
  };
}
