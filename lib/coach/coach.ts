import {
  TranscriptSegment,
  CoachingArtifact,
  SKILLS,
} from "@/lib/storage/schema";
import { COACHING_SYSTEM_PROMPT, buildCoachingPrompt } from "./prompts";

type CallMetadata = {
  title: string;
  rep_name: string;
  duration_sec: number;
};

function formatTranscriptForPrompt(segments: TranscriptSegment[]): string {
  return segments
    .map(
      (seg) =>
        `[${formatTimestamp(seg.start_time)}] ${seg.speaker}: ${seg.text}`
    )
    .join("\n");
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function generateCoachingArtifact(
  transcript: TranscriptSegment[],
  metadata: CallMetadata
): Promise<CoachingArtifact> {
  const apiKey = process.env.COACH_MODEL_API_KEY;
  if (!apiKey) {
    throw new Error("COACH_MODEL_API_KEY environment variable is not set");
  }

  const transcriptText = formatTranscriptForPrompt(transcript);
  const userPrompt = buildCoachingPrompt(transcriptText, metadata);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: COACHING_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Claude API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error("No response from Claude API");
  }

  let artifact: CoachingArtifact;
  try {
    artifact = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      artifact = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse coaching response as JSON");
    }
  }

  validateArtifact(artifact);

  return artifact;
}

function validateArtifact(artifact: CoachingArtifact): void {
  if (!artifact.scores || typeof artifact.scores !== "object") {
    throw new Error("Invalid coaching artifact: missing scores");
  }
  for (const skill of SKILLS) {
    if (typeof artifact.scores[skill] !== "number") {
      artifact.scores[skill] = 3;
    }
  }
  if (!Array.isArray(artifact.strengths)) {
    artifact.strengths = [];
  }
  if (!Array.isArray(artifact.improvements)) {
    artifact.improvements = [];
  }
  if (!Array.isArray(artifact.objections)) {
    artifact.objections = [];
  }
  if (!Array.isArray(artifact.evidence)) {
    artifact.evidence = [];
  }
  if (typeof artifact.summary !== "string") {
    artifact.summary = "";
  }
}
