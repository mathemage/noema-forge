import { describe, expect, it } from "vitest";
import {
  crisisLocaleValues,
  getCrisisResources,
  NOT_EQUIPPED_STATEMENT,
} from "@/lib/safety/crisis-resources";

describe("getCrisisResources", () => {
  it("gives every configurable locale an emergency number and at least one line", () => {
    for (const locale of crisisLocaleValues) {
      const { emergency, label, resources } = getCrisisResources(locale);

      expect(emergency).not.toBe("");
      expect(label).not.toBe("");
      expect(resources.length).toBeGreaterThan(0);

      for (const resource of resources) {
        expect(resource.name).not.toBe("");
        expect(resource.contact).not.toBe("");
      }
    }
  });

  it("returns the hard-coded set for the locale, with no lookup or generation step", () => {
    expect(getCrisisResources("us").emergency).toBe("911");
    expect(getCrisisResources("gb").emergency).toBe("999");
    expect(getCrisisResources("cz").emergency).toBe("112");
    expect(getCrisisResources("us")).toBe(getCrisisResources("us"));
  });

  it("states plainly that the app cannot handle a crisis", () => {
    expect(NOT_EQUIPPED_STATEMENT).toContain("not equipped");
    expect(NOT_EQUIPPED_STATEMENT).toContain("cannot contact anyone");
  });
});
