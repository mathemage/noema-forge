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
        registerAction="/auth/register"
        signInAction="/auth/sign-in"
        useAuthJsCredentials={true}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Private multimodal capture, ready when you are.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Create account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByText("Check your email and password, then try again."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /This environment is using the optional Auth\.js credentials session path\./,
      ),
    ).toBeInTheDocument();
  });
});
