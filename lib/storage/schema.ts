export type CallRecord = {
  call_id: string;
  title: string;
  rep_id: string;
  rep_name: string;
  start_time_iso: string;
  duration_sec: number;
  fathom_url: string;
  transcript_path: string;
  synced_at_iso: string;
};

export type CoachingRecord = {
  call_id: string;
  rep_id: string;
  coached_at_iso: string;
  scores_json: string;
  strengths_json: string;
  improvements_json: string;
  objections_json: string;
  evidence_json: string;
  coach_summary_md: string;
  version: string;
};

export type RepLedgerRecord = {
  rep_id: string;
  skill_id: string;
  rolling_score_10: number;
  prev_rolling_score_10: number;
  trend_delta: number;
  last_updated_iso: string;
  open_focus_area: boolean;
};

export type TranscriptSegment = {
  speaker: string;
  text: string;
  start_time: number;
  end_time: number;
};

export type Transcript = {
  call_id: string;
  segments: TranscriptSegment[];
};

export type CoachingScores = Record<string, number>;

export type Objection = {
  objection: string;
  handling: string;
};

export type Evidence = {
  timestamp: number;
  quote: string;
  skill: string;
  assessment: string;
};

export type CoachingArtifact = {
  scores: CoachingScores;
  strengths: string[];
  improvements: string[];
  objections: Objection[];
  evidence: Evidence[];
  summary: string;
};

export const COACHING_VERSION = "1.0";

export const SKILLS = [
  "Discovery",
  "Active Listening",
  "Value Articulation",
  "Objection Handling",
  "Closing",
  "Rapport Building",
  "Product Knowledge",
  "Competitive Positioning",
] as const;

export type SkillId = (typeof SKILLS)[number];
