export type CutDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-left"
  | "up-right"
  | "down-left"
  | "down-right";

export type Vector2 = {
  x: number;
  y: number;
};

export const DIRECTION_VECTORS: Record<CutDirection, Vector2> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  "up-left": { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
  "up-right": { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  "down-left": { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
  "down-right": { x: Math.SQRT1_2, y: -Math.SQRT1_2 }
};

export function vectorMagnitude(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalizeVector(vector: Vector2): Vector2 {
  const magnitude = vectorMagnitude(vector);

  if (magnitude === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude
  };
}

export function directionMatches(
  expectedDirection: CutDirection,
  movement: Vector2,
  toleranceDegrees = 55
): boolean {
  const normalizedMovement = normalizeVector(movement);
  const expected = DIRECTION_VECTORS[expectedDirection];
  const dot = normalizedMovement.x * expected.x + normalizedMovement.y * expected.y;
  const tolerance = Math.cos((toleranceDegrees * Math.PI) / 180);

  return vectorMagnitude(movement) > 0.02 && dot >= tolerance;
}
