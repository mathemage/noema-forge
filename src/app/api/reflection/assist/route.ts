import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import {
  reflectionAssistRequestSchema,
  requestReflectionAssistance,
} from "@/lib/journal/reflection-assist";

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = reflectionAssistRequestSchema.safeParse(await request.json());

  if (!result.success) {
    return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  }

  const assistance = await requestReflectionAssistance(result.data);

  return NextResponse.json(assistance);
}

export const POST = auth(handlePost);
