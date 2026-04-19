import { describe, expect, it } from "vitest";
import { excerptText } from "@/lib/formatting";

describe("excerptText", () => {
  it("returns the original text when it is at or below the max length", () => {
    expect(excerptText("typed entry", 11)).toBe("typed entry");
    expect(excerptText("typed entry", 20)).toBe("typed entry");
  });

  it("trims trailing whitespace before adding an ellipsis", () => {
    expect(excerptText("typed entry   rest", 14)).toBe("typed entry...");
  });

  it("uses a custom max length when truncating", () => {
    expect(excerptText("journal history search", 7)).toBe("journal...");
  });
});
