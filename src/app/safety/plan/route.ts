import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { redirectToRequestOrigin } from "@/lib/request-url";
import { SafetyError, saveSafetyPlan } from "@/lib/safety/service";

function getField(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

async function handlePost(request: NextAuthRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  const formData = await request.formData();

  try {
    await saveSafetyPlan(
      {
        distraction: getField(formData, "distraction"),
        internalCoping: getField(formData, "internalCoping"),
        meansSafety: getField(formData, "meansSafety"),
        meansSafetyAcknowledged: formData.has("meansSafetyAcknowledged"),
        professionalContacts: getField(formData, "professionalContacts"),
        supportContacts: getField(formData, "supportContacts"),
        warningSigns: getField(formData, "warningSigns"),
      },
      user.id,
    );
  } catch (error) {
    if (error instanceof SafetyError) {
      return redirectToRequestOrigin(`/safety?error=${error.code}`);
    }

    throw error;
  }

  return redirectToRequestOrigin("/safety?message=plan-saved");
}

export const POST = auth(handlePost);
