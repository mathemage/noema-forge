import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/db/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    await checkDatabaseConnection();

    return NextResponse.json({
      checks: [{ key: "database", status: "ok" }],
      status: "ok",
    });
  } catch {
    return NextResponse.json(
      {
        checks: [{ key: "database", status: "unavailable" }],
        status: "unavailable",
      },
      { status: 503 },
    );
  }
}
