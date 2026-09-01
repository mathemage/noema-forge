import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { redirectToRequestOrigin } from "@/lib/request-url";
import { setTraumaWritingConsent } from "@/lib/safety/service";

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  const formData = await request.formData();
  const consented = formData.get("consent") === "opt-in";

  await setTraumaWritingConsent(user.id, consented);

  return redirectToRequestOrigin(
    `/safety/trauma-writing?message=${consented ? "opted-in" : "opted-out"}`,
  );
}

export const POST = auth(handlePost);
