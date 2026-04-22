import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/auth";
import { usesAuthJsCredentials } from "@/lib/env";

function getDisabledResponse() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function GET(request: NextRequest) {
  if (!usesAuthJsCredentials()) {
    return getDisabledResponse();
  }

  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!usesAuthJsCredentials()) {
    return getDisabledResponse();
  }

  return handlers.POST(request);
}
