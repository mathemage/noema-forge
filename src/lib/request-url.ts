import type { NextRequest } from "next/server";
import { readServerEnv } from "@/lib/env";

function getConfiguredOrigin() {
  return readServerEnv().NEXT_PUBLIC_APP_URL;
}

function getFirstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}

export function getRequestOrigin(request: NextRequest) {
  const host =
    getFirstHeaderValue(request.headers.get("x-forwarded-host")) ??
    getFirstHeaderValue(request.headers.get("host")) ??
    request.nextUrl.host;
  const protocol =
    getFirstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    request.nextUrl.protocol.replace(":", "");

  if (!host || (protocol !== "http" && protocol !== "https")) {
    return getConfiguredOrigin();
  }

  try {
    return new URL(`${protocol}://${host}`).origin;
  } catch {
    return getConfiguredOrigin();
  }
}

export function getRequestUrl(pathname: string) {
  return new URL(pathname, getConfiguredOrigin());
}
