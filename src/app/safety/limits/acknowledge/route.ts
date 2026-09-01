import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { redirectToRequestOrigin } from "@/lib/request-url";
import { acknowledgeLimits } from "@/lib/safety/service";

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  await acknowledgeLimits(user.id);

  return redirectToRequestOrigin("/");
}

export const POST = auth(handlePost);
