import { describe, expect, it } from "vitest";
import { FIRST_TRACK_CHART, getTrackDurationSeconds, scheduleChart } from "./chart";
import { directionMatches } from "./directions";
import { applyCutResult, getRank, INITIAL_SCORE_STATE, judgeCut } from "./scoring";
import { readBestScore, saveBestScore, type ScoreStorage } from "./storage";

function memoryStorage(initialValue?: string): ScoreStorage {
  const values = new Map<string, string>();

  if (initialValue) {
    values.set("neon-saber-best-score", initialValue);
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    }
  };
}

describe("chart scheduling", () => {
  it("turns authored beat blocks into audio-clock hit and spawn times", () => {
    const scheduled = scheduleChart([
      { id: "test", beat: 8, cell: { column: 1, row: 1 }, direction: "down" }
    ], 120, 2);

    expect(scheduled[0]).toMatchObject({
      id: "test",
      hitTimeSeconds: 4,
      spawnTimeSeconds: 2
    });
  });

  it("defines a complete first track instead of an endless stream", () => {
    expect(FIRST_TRACK_CHART.length).toBeGreaterThanOrEqual(20);
    expect(getTrackDurationSeconds(FIRST_TRACK_CHART)).toBeGreaterThanOrEqual(60);
    expect(getTrackDurationSeconds(FIRST_TRACK_CHART)).toBeLessThanOrEqual(90);
  });
});

describe("cut direction matching", () => {
  it("accepts a generous diagonal movement for the expected cut direction", () => {
    expect(directionMatches("up-right", { x: 0.8, y: 1 })).toBe(true);
  });

  it("rejects the opposite slash direction", () => {
    expect(directionMatches("up", { x: 0, y: -1 })).toBe(false);
  });
});

describe("scoring", () => {
  it("rewards clean direction-matched cuts with timing and follow-through points", () => {
    const result = judgeCut({
      expectedDirection: "down",
      movement: { x: 0.02, y: -1 },
      timeOffsetSeconds: 0.03,
      followThrough: 0.8
    });

    expect(result).toMatchObject({
      hit: true,
      timing: "clean",
      directionMatched: true
    });
    expect(result.points).toBeGreaterThan(80);
  });

  it("breaks combo on a miss and produces an end-summary rank", () => {
    const hit = judgeCut({
      expectedDirection: "right",
      movement: { x: 1, y: 0 },
      timeOffsetSeconds: 0,
      followThrough: 1
    });
    const miss = judgeCut({
      expectedDirection: "left",
      movement: { x: 1, y: 0 },
      timeOffsetSeconds: 0,
      followThrough: 1
    });

    const afterHit = applyCutResult(INITIAL_SCORE_STATE, hit);
    const afterMiss = applyCutResult(afterHit, miss);

    expect(afterHit.combo).toBe(1);
    expect(afterMiss.combo).toBe(0);
    expect(afterMiss.misses).toBe(1);
    expect(getRank(afterMiss)).toBe("C");
  });
});

describe("best score persistence", () => {
  it("keeps the higher local best score", () => {
    const storage = memoryStorage(JSON.stringify({ score: 1200, rank: "B" }));

    const best = saveBestScore(storage, { score: 900, rank: "C" });

    expect(best).toEqual({ score: 1200, rank: "B" });
    expect(readBestScore(storage)).toEqual({ score: 1200, rank: "B" });
  });
});
