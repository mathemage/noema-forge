// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { JournalChrome } from "@/components/journal-chrome";

describe("JournalChrome", () => {
  it("keeps account and page actions in accessible visual-system landmarks", () => {
    const { container } = render(
      <JournalChrome
        actions={<Link href="/entries/entry-1/edit">Edit entry</Link>}
        appName="NoemaForge"
        description="Review one private entry."
        signOutAction="/auth/sign-out"
        title="Entry detail"
        userEmail="writer@example.com"
      >
        <section>Entry content</section>
      </JournalChrome>,
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toHaveClass("ink-panel");
    expect(screen.getByRole("heading", { name: "Entry detail" })).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Journal page actions" }),
    ).toContainElement(screen.getByRole("link", { name: "Edit entry" }));
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveClass(
      "button-inverse",
    );
    expect(container.querySelector(".brand-mark")).toHaveTextContent("N");
  });
});
