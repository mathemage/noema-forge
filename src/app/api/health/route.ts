import { NextResponse } from "next/server";
import { getBootstrapChecks, getBootstrapSummary } from "@/lib/bootstrap";
import { readServerEnv } from "@/lib/env";

export async function GET() {
  const env = readServerEnv();
  const checks = getBootstrapChecks(env);
  const summary = getBootstrapSummary(checks);

  return NextResponse.json({
    app: env.NEXT_PUBLIC_APP_NAME,
    checks,
    readiness: summary,
    status: "ok",
  });
}
