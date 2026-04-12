// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { BootstrapShell } from "@/components/bootstrap-shell";

describe("BootstrapShell", () => {
  it("renders the bootstrap headline and health route link", () => {
    render(
      <BootstrapShell
        appName="NoemaForge"
        checks={[
          {
            configured: true,
            detail: "shell detail",
            key: "shell",
            label: "Responsive shell",
          },
          {
            configured: false,
            detail: "db detail",
            key: "database",
            label: "PostgreSQL + Drizzle",
          },
        ]}
        summary={{
          configured: 1,
          label: "Partial readiness",
          ready: false,
          total: 2,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Bootstrap the journaling foundation",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open /api/health" }),
    ).toHaveAttribute("href", "/api/health");
    expect(screen.getByText("PostgreSQL + Drizzle")).toBeInTheDocument();
  });
});
