import { describe, expect, it } from "vitest";
import { APP_TAGLINE, APP_TITLE } from "./appInfo";

describe("app identity", () => {
  it("uses the cursor rhythm title and touch-first tagline", () => {
    expect(APP_TITLE).toBe("Neon Cursor");
    expect(APP_TAGLINE).toContain("Touch the beat blocks");
  });
});
