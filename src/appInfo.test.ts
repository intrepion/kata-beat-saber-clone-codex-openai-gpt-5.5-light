import { describe, expect, it } from "vitest";
import { APP_TAGLINE, APP_TITLE } from "./appInfo";

describe("app identity", () => {
  it("uses the original rhythm-saber title and mouse-first tagline", () => {
    expect(APP_TITLE).toBe("Neon Saber");
    expect(APP_TAGLINE).toContain("One mouse. One saber.");
  });
});
