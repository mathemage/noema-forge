import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";
import { getRequestUser } from "@/lib/auth/request";
import { redirectToRequestOrigin } from "@/lib/request-url";
import {
  isSeverityInstrument,
  severityInstruments,
} from "@/lib/safety/instruments";
import { recordSeverityCheckIn, SafetyError } from "@/lib/safety/service";

type CheckInSaveRouteContext = {
  params: Promise<{ instrument: string }>;
};

/** A missing or blank response has no score, so it must not read as a zero. */
function readAnswer(formData: FormData, index: number) {
  const value = formData.get(`answer-${index}`);

  return typeof value === "string" && value !== "" ? Number(value) : Number.NaN;
}

async function handlePost(
  request: NextAuthRequest,
  context: CheckInSaveRouteContext,
) {
  const { instrument } = await context.params;

  if (!isSeverityInstrument(instrument)) {
    return redirectToRequestOrigin("/safety");
  }

  const user = await getRequestUser(request);

  if (!user) {
    return redirectToRequestOrigin("/sign-in");
  }

  const formData = await request.formData();
  const answers = severityInstruments[instrument].items.map((_, index) =>
    readAnswer(formData, index),
  );

  try {
    await recordSeverityCheckIn(instrument, answers, user.id);
  } catch (error) {
    if (error instanceof SafetyError) {
      return redirectToRequestOrigin(
        `/safety/check-in/${instrument}?error=${error.code}`,
      );
    }

    throw error;
  }

  return redirectToRequestOrigin("/safety?message=check-in-saved");
}

export const POST = auth(handlePost);
