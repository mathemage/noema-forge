import { BootstrapShell } from "@/components/bootstrap-shell";
import { getBootstrapChecks, getBootstrapSummary } from "@/lib/bootstrap";
import { readServerEnv } from "@/lib/env";

export default function Home() {
  const env = readServerEnv();
  const checks = getBootstrapChecks(env);
  const summary = getBootstrapSummary(checks);

  return (
    <BootstrapShell
      appName={env.NEXT_PUBLIC_APP_NAME}
      checks={checks}
      summary={summary}
    />
  );
}
