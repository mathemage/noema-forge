import type { NextRequest } from "next/server";
import { readServerEnv } from "@/lib/env";

export function getRequestOrigin(request: NextRequest) {
  const host = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host
  )
    .split(",")[0]
    .trim();
  const rawProto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  const protocol = rawProto.split(",")[0].trim() === "https" ? "https" : "http";

  return `${protocol}://${host}`;
}

export function getRequestUrl(request: NextRequest, pathname: string) {
  void request;
  return new URL(pathname, readServerEnv().NEXT_PUBLIC_APP_URL);
}
