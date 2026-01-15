import {
  TranscriptSegment,
  CoachingArtifact,
  SKILLS,
} from "@/lib/storage/schema";
import { COACHING_SYSTEM_PROMPT, buildCoachingPrompt } from "./prompts";
import { getProviderForModel } from "./providers";

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

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

export async function generateCoachingArtifact(
  transcript: TranscriptSegment[],
  metadata: CallMetadata,
  modelId: string = DEFAULT_MODEL
): Promise<CoachingArtifact> {
  const transcriptText = formatTranscriptForPrompt(transcript);
  const userPrompt = buildCoachingPrompt(transcriptText, metadata);

  const provider = getProviderForModel(modelId);
  const content = await provider.generateCompletion(
    COACHING_SYSTEM_PROMPT,
    userPrompt,
    modelId
  );

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
