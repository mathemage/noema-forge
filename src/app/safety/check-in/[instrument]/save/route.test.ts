import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({
  auth: vi.fn((handler) => handler),
}));

vi.mock("@/lib/auth/request", () => ({
  getRequestUser: vi.fn(),
}));

vi.mock("@/lib/safety/service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/safety/service")>();

  return { ...actual, recordSeverityCheckIn: vi.fn() };
});

import { POST } from "@/app/safety/check-in/[instrument]/save/route";
import { getRequestUser } from "@/lib/auth/request";
import { recordSeverityCheckIn, SafetyError } from "@/lib/safety/service";

function signIn() {
  vi.mocked(getRequestUser).mockResolvedValue({
    createdAt: new Date(),
    displayName: null,
    email: "user@example.com",
    id: "user-1",
    updatedAt: new Date(),
  });
}

function answers(values: number[]) {
  const formData = new FormData();

  values.forEach((value, index) => formData.set(`answer-${index}`, String(value)));

  return formData;
}

async function post(instrument: string, formData: FormData) {
  const response = await POST(
    new NextRequest(
      `http://127.0.0.1:3000/safety/check-in/${instrument}/save`,
      { body: formData, method: "POST" },
    ),
    { params: Promise.resolve({ instrument }) },
  );

  return {
    location: response.headers.get("location"),
    status: response.status,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /safety/check-in/[instrument]/save", () => {
  it("redirects unauthenticated requests to sign-in", async () => {
    vi.mocked(getRequestUser).mockResolvedValue(null);

    await expect(post("phq-9", answers(Array(9).fill(1)))).resolves.toMatchObject({
      location: "/sign-in",
    });
    expect(recordSeverityCheckIn).not.toHaveBeenCalled();
  });

  it("passes every published item through to scoring", async () => {
    signIn();
    vi.mocked(recordSeverityCheckIn).mockResolvedValue(13);

    await expect(
      post("phq-9", answers([0, 1, 2, 3, 0, 1, 2, 3, 1])),
    ).resolves.toMatchObject({
      location: "/safety?message=check-in-saved",
      status: 303,
    });
    expect(recordSeverityCheckIn).toHaveBeenCalledWith(
      "phq-9",
      [0, 1, 2, 3, 0, 1, 2, 3, 1],
      "user-1",
    );
  });

  it("treats a missing answer as unanswered rather than as a zero", async () => {
    signIn();
    vi.mocked(recordSeverityCheckIn).mockRejectedValue(
      new SafetyError("invalid-input"),
    );

    await expect(post("gad-7", answers([1, 1, 1]))).resolves.toMatchObject({
      location: "/safety/check-in/gad-7?error=invalid-input",
    });
    expect(vi.mocked(recordSeverityCheckIn).mock.calls[0][1]).toEqual([
      1,
      1,
      1,
      Number.NaN,
      Number.NaN,
      Number.NaN,
      Number.NaN,
    ]);
  });

  it("ignores an unknown instrument", async () => {
    signIn();

    await expect(post("phq-2", answers([1]))).resolves.toMatchObject({
      location: "/safety",
    });
    expect(recordSeverityCheckIn).not.toHaveBeenCalled();
  });
});
