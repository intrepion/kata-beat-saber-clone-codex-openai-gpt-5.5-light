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

export const FIRST_TRACK_CHART: BeatBlock[] = [
  { id: "b001", beat: 4, cell: { column: 1, row: 1 }, direction: "down" },
  { id: "b002", beat: 6, cell: { column: 0, row: 1 }, direction: "right" },
  { id: "b003", beat: 8, cell: { column: 2, row: 1 }, direction: "left" },
  { id: "b004", beat: 10, cell: { column: 1, row: 2 }, direction: "down" },
  { id: "b005", beat: 12, cell: { column: 1, row: 0 }, direction: "up" },
  { id: "b006", beat: 14, cell: { column: 0, row: 2 }, direction: "down-right" },
  { id: "b007", beat: 16, cell: { column: 2, row: 2 }, direction: "down-left" },
  { id: "b008", beat: 18, cell: { column: 0, row: 0 }, direction: "up-right" },
  { id: "b009", beat: 20, cell: { column: 2, row: 0 }, direction: "up-left" },
  { id: "b010", beat: 22, cell: { column: 1, row: 1 }, direction: "up" },
  { id: "b011", beat: 24, cell: { column: 0, row: 1 }, direction: "up-right" },
  { id: "b012", beat: 26, cell: { column: 2, row: 1 }, direction: "up-left" },
  { id: "b013", beat: 28, cell: { column: 1, row: 2 }, direction: "left" },
  { id: "b014", beat: 30, cell: { column: 1, row: 0 }, direction: "right" },
  { id: "b015", beat: 32, cell: { column: 0, row: 2 }, direction: "down" },
  { id: "b016", beat: 34, cell: { column: 2, row: 0 }, direction: "up" },
  { id: "b017", beat: 36, cell: { column: 0, row: 0 }, direction: "right" },
  { id: "b018", beat: 38, cell: { column: 2, row: 2 }, direction: "left" },
  { id: "b019", beat: 40, cell: { column: 1, row: 1 }, direction: "down-left" },
  { id: "b020", beat: 42, cell: { column: 1, row: 1 }, direction: "up-right" }
];

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
