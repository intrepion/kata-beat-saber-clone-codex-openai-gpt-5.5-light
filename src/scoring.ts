import { directionMatches, type CutDirection, type Vector2 } from "./directions";

export type TimingFeedback = "early" | "late" | "clean" | "miss";

export type CutAttempt = {
  expectedDirection: CutDirection;
  movement: Vector2;
  timeOffsetSeconds: number;
  followThrough: number;
};

export type CutResult = {
  hit: boolean;
  points: number;
  timing: TimingFeedback;
  directionMatched: boolean;
};

export type ScoreState = {
  score: number;
  combo: number;
  maxCombo: number;
  hits: number;
  misses: number;
  attempts: number;
};

export type Rank = "S" | "A" | "B" | "C" | "D";

export const INITIAL_SCORE_STATE: ScoreState = {
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  misses: 0,
  attempts: 0
};

export function judgeCut(attempt: CutAttempt): CutResult {
  const absOffset = Math.abs(attempt.timeOffsetSeconds);
  const timing = getTimingFeedback(attempt.timeOffsetSeconds);
  const directionMatched = directionMatches(attempt.expectedDirection, attempt.movement);
  const hit = absOffset <= 0.28 && directionMatched;

  if (!hit) {
    return {
      hit: false,
      points: 0,
      timing: absOffset > 0.28 ? timing : "miss",
      directionMatched
    };
  }

  const timingPoints = Math.max(0, 70 - Math.round(absOffset * 180));
  const followThroughPoints = Math.min(30, Math.round(Math.max(0, attempt.followThrough) * 30));

  return {
    hit: true,
    points: timingPoints + followThroughPoints,
    timing,
    directionMatched
  };
}

export function applyCutResult(state: ScoreState, result: CutResult): ScoreState {
  if (!result.hit) {
    return {
      ...state,
      combo: 0,
      misses: state.misses + 1,
      attempts: state.attempts + 1
    };
  }

  const combo = state.combo + 1;
  const comboBonus = Math.floor(combo / 4) * 10;

  return {
    score: state.score + result.points + comboBonus,
    combo,
    maxCombo: Math.max(state.maxCombo, combo),
    hits: state.hits + 1,
    misses: state.misses,
    attempts: state.attempts + 1
  };
}

export function getRank(state: ScoreState): Rank {
  if (state.attempts === 0) {
    return "D";
  }

  const accuracy = state.hits / state.attempts;

  if (accuracy >= 0.95 && state.misses === 0) {
    return "S";
  }

  if (accuracy >= 0.85) {
    return "A";
  }

  if (accuracy >= 0.7) {
    return "B";
  }

  if (accuracy >= 0.5) {
    return "C";
  }

  return "D";
}

function getTimingFeedback(offsetSeconds: number): TimingFeedback {
  if (Math.abs(offsetSeconds) <= 0.09) {
    return "clean";
  }

  return offsetSeconds < 0 ? "early" : "late";
}
