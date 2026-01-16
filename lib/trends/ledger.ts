import { readCsv, upsertRowComposite } from "@/lib/storage/supabase";
import {
  CoachingRecord,
  RepLedgerRecord,
  CoachingScores,
  SKILLS,
} from "@/lib/storage/schema";

const ROLLING_WINDOW = 10;

export async function updateRepLedger(
  repId: string,
  newScores: CoachingScores
): Promise<void> {
  const coachingRecords = await readCsv<CoachingRecord>("coaching.csv");
  const repCoaching = coachingRecords
    .filter((c) => c.rep_id === repId)
    .sort(
      (a, b) =>
        new Date(b.coached_at_iso).getTime() -
        new Date(a.coached_at_iso).getTime()
    )
    .slice(0, ROLLING_WINDOW);

  const currentLedger = await readCsv<RepLedgerRecord>("rep_ledger.csv");

  for (const skill of SKILLS) {
    const skillScores = repCoaching
      .map((c) => {
        const scores = JSON.parse(c.scores_json || "{}") as CoachingScores;
        return scores[skill];
      })
      .filter((s) => typeof s === "number");

    if (skillScores.length === 0) continue;

    const rollingScore =
      skillScores.reduce((a, b) => a + b, 0) / skillScores.length;

    const existing = currentLedger.find(
      (r) => r.rep_id === repId && r.skill_id === skill
    );

    const prevScore = existing?.rolling_score_10 ?? rollingScore;
    const trendDelta = rollingScore - prevScore;

    const ledgerRecord: RepLedgerRecord = {
      rep_id: repId,
      skill_id: skill,
      rolling_score_10: rollingScore,
      prev_rolling_score_10: prevScore,
      trend_delta: trendDelta,
      last_updated_iso: new Date().toISOString(),
      open_focus_area: rollingScore < 3 || trendDelta < -0.5,
    };

    await upsertRowComposite("rep_ledger.csv", ["rep_id", "skill_id"], ledgerRecord);
  }
}

export async function getRepTrends(repId: string): Promise<RepLedgerRecord[]> {
  const ledger = await readCsv<RepLedgerRecord>("rep_ledger.csv");
  return ledger.filter((r) => r.rep_id === repId);
}
