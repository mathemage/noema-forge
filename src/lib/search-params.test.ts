import { describe, expect, it } from "vitest";
import { getSingleSearchParam } from "@/lib/search-params";

describe("getSingleSearchParam", () => {
  it("returns string values unchanged", () => {
    expect(getSingleSearchParam("signed-out")).toBe("signed-out");
  });

  it("returns the first value from an array", () => {
    expect(getSingleSearchParam(["first", "second"])).toBe("first");
  });

  it("returns undefined for empty arrays and missing values", () => {
    expect(getSingleSearchParam([])).toBeUndefined();
    expect(getSingleSearchParam(undefined)).toBeUndefined();
  });
});
