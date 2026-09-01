import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({
  auth: vi.fn((handler) => handler),
}));

vi.mock("@/lib/auth/request", () => ({
  getRequestUser: vi.fn(),
}));

vi.mock("@/lib/safety/service", () => ({
  SafetyError: class SafetyError extends Error {
    code: string;

    constructor(code: string) {
      super(code);
      this.code = code;
      this.name = "SafetyError";
    }
  },
  saveSafetyPlan: vi.fn(),
}));

import { POST } from "@/app/safety/plan/route";
import { getRequestUser } from "@/lib/auth/request";
import { SafetyError, saveSafetyPlan } from "@/lib/safety/service";

function signIn() {
  vi.mocked(getRequestUser).mockResolvedValue({
    createdAt: new Date(),
    displayName: null,
    email: "user@example.com",
    id: "user-1",
    updatedAt: new Date(),
  });
}

function planFormData() {
  const formData = new FormData();

  formData.set("warningSigns", "Skipping meals");
  formData.set("internalCoping", "Walk");
  formData.set("distraction", "The park");
  formData.set("supportContacts", "Jana");
  formData.set("professionalContacts", "Out of hours line");
  formData.set("meansSafety", "Pills to a neighbour");

  return formData;
}

async function post(formData: FormData) {
  const response = await POST(
    new NextRequest("http://127.0.0.1:3000/safety/plan", {
      body: formData,
      method: "POST",
    }),
  );

  return {
    location: response.headers.get("location"),
    status: response.status,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /safety/plan", () => {
  it("redirects unauthenticated requests to sign-in", async () => {
    vi.mocked(getRequestUser).mockResolvedValue(null);

    await expect(post(planFormData())).resolves.toMatchObject({
      location: "/sign-in",
    });
    expect(saveSafetyPlan).not.toHaveBeenCalled();
  });

  it("saves the six steps and the means-safety acknowledgement", async () => {
    signIn();

    const formData = planFormData();
    formData.set("meansSafety", "");
    formData.set("meansSafetyAcknowledged", "on");

    await expect(post(formData)).resolves.toMatchObject({
      location: "/safety?message=plan-saved",
      status: 303,
    });
    expect(saveSafetyPlan).toHaveBeenCalledWith(
      {
        distraction: "The park",
        internalCoping: "Walk",
        meansSafety: "",
        meansSafetyAcknowledged: true,
        professionalContacts: "Out of hours line",
        supportContacts: "Jana",
        warningSigns: "Skipping meals",
      },
      "user-1",
    );
  });

  it("sends a plan that skipped means safety back with the reason", async () => {
    signIn();
    vi.mocked(saveSafetyPlan).mockRejectedValue(
      new SafetyError("means-safety-required"),
    );

    await expect(post(planFormData())).resolves.toMatchObject({
      location: "/safety?error=means-safety-required",
    });
  });
});
