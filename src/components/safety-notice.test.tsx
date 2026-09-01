// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { LIMITS_STATEMENT, SafetyNotice } from "@/components/safety-notice";

describe("SafetyNotice", () => {
  it("states the limits and shows the configured locale's crisis line", () => {
    render(<SafetyNotice locale="us" />);

    const notice = screen.getByLabelText("Safety and limits");

    expect(notice).toHaveTextContent("It is not therapy");
    expect(notice).toHaveTextContent("does not diagnose");
    expect(notice).toHaveTextContent("written by a language model");
    expect(notice).toHaveTextContent("not equipped to handle a crisis");
    expect(notice).toHaveTextContent("Emergency: 911");
    expect(notice).toHaveTextContent("988 Suicide and Crisis Lifeline");
  });

  it("swaps the whole resource set with the locale", () => {
    render(<SafetyNotice locale="gb" />);

    const notice = screen.getByLabelText("Safety and limits");

    expect(notice).toHaveTextContent("Emergency: 999");
    expect(notice).toHaveTextContent("Samaritans: 116 123");
    expect(notice).not.toHaveTextContent("911");
  });

  it("puts the crisis resources and safety plan one click away", () => {
    render(<SafetyNotice locale="international" />);

    expect(
      screen.getByRole("link", { name: "Crisis resources and safety plan" }),
    ).toHaveAttribute("href", "/safety");
    expect(LIMITS_STATEMENT).toContain("It is not therapy");
  });
});
