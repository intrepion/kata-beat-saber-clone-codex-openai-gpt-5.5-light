import type { CutDirection } from "./directions";

export type GridCell = {
  column: 0 | 1 | 2;
  row: 0 | 1 | 2;
};

export type BeatBlock = {
  id: string;
  beat: number;
  cell: GridCell;
  direction: CutDirection;
};

export type ScheduledBeatBlock = BeatBlock & {
  hitTimeSeconds: number;
  spawnTimeSeconds: number;
};

export const BEATS_PER_MINUTE = 112;
export const BLOCK_TRAVEL_SECONDS = 2.2;

const TUTORIAL_PATTERN: Omit<BeatBlock, "id" | "beat">[] = [
  { cell: { column: 1, row: 1 }, direction: "down" },
  { cell: { column: 0, row: 1 }, direction: "right" },
  { cell: { column: 2, row: 1 }, direction: "left" },
  { cell: { column: 1, row: 2 }, direction: "down" },
  { cell: { column: 1, row: 0 }, direction: "up" },
  { cell: { column: 0, row: 2 }, direction: "down-right" },
  { cell: { column: 2, row: 2 }, direction: "down-left" },
  { cell: { column: 0, row: 0 }, direction: "up-right" },
  { cell: { column: 2, row: 0 }, direction: "up-left" },
  { cell: { column: 1, row: 1 }, direction: "up" },
  { cell: { column: 0, row: 1 }, direction: "up-right" },
  { cell: { column: 2, row: 1 }, direction: "up-left" },
  { cell: { column: 1, row: 2 }, direction: "left" },
  { cell: { column: 1, row: 0 }, direction: "right" },
  { cell: { column: 0, row: 2 }, direction: "down" },
  { cell: { column: 2, row: 0 }, direction: "up" }
];

export const FIRST_TRACK_CHART: BeatBlock[] = Array.from({ length: 66 }, (_, index) => {
  const pattern = TUTORIAL_PATTERN[index % TUTORIAL_PATTERN.length];
  const cycle = Math.floor(index / TUTORIAL_PATTERN.length);
  const spacing = cycle < 1 ? 2.4 : cycle < 3 ? 2 : 1.6;

  return {
    id: `b${String(index + 1).padStart(3, "0")}`,
    beat: 4 + index * spacing,
    ...pattern
  };
});

export function beatToSeconds(beat: number, bpm = BEATS_PER_MINUTE): number {
  return (beat * 60) / bpm;
}

export function scheduleChart(
  chart: BeatBlock[],
  bpm = BEATS_PER_MINUTE,
  travelSeconds = BLOCK_TRAVEL_SECONDS
): ScheduledBeatBlock[] {
  return chart.map((block) => {
    const hitTimeSeconds = beatToSeconds(block.beat, bpm);

    return {
      ...block,
      hitTimeSeconds,
      spawnTimeSeconds: hitTimeSeconds - travelSeconds
    };
  });
}

export function getTrackDurationSeconds(chart: BeatBlock[] = FIRST_TRACK_CHART): number {
  const finalBeat = Math.max(...chart.map((block) => block.beat));
  return beatToSeconds(finalBeat + 6);
}
