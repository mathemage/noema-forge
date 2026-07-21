import { NextResponse, type NextRequest } from "next/server";
import { readServerEnv } from "@/lib/env";

function getConfiguredOrigin() {
  return readServerEnv().NEXT_PUBLIC_APP_URL;
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}

export function getRequestOrigin(request: NextRequest) {
  const host =
    getFirstHeaderValue(request.headers.get("host")) ?? request.nextUrl.host;
  const forwardedProtocol = getFirstHeaderValue(
    request.headers.get("x-forwarded-proto"),
  );
  const protocol =
    request.nextUrl.protocol === "https:" || forwardedProtocol === "https"
      ? "https"
      : "http";

  if (!host) {
    return getConfiguredOrigin();
  }

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return getConfiguredOrigin();
  }
}

export function redirectToRequestOrigin(pathname: string) {
  return new NextResponse(null, {
    headers: { location: pathname },
    status: 303,
  });
}
