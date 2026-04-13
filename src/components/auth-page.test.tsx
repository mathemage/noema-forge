// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { AuthPage } from "@/components/auth-page";

describe("AuthPage", () => {
  it("renders registration and sign-in sections with auth feedback", () => {
    render(
      <AuthPage
        appName="NoemaForge"
        error="invalid-credentials"
        message={undefined}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Private typed capture, ready when you are.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByText("Check your email and password, then try again."),
    ).toBeInTheDocument();
  });
});
