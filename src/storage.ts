export type BestScore = {
  score: number;
  rank: string;
};

const BEST_SCORE_KEY = "neon-saber-best-score";

export type ScoreStorage = Pick<Storage, "getItem" | "setItem">;

export function readBestScore(storage: ScoreStorage): BestScore | null {
  const rawValue = storage.getItem(BEST_SCORE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as BestScore;

    if (typeof parsed.score !== "number" || typeof parsed.rank !== "string") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveBestScore(
  storage: ScoreStorage,
  candidate: BestScore
): BestScore {
  const current = readBestScore(storage);
  const best = !current || candidate.score > current.score ? candidate : current;
  storage.setItem(BEST_SCORE_KEY, JSON.stringify(best));
  return best;
}
