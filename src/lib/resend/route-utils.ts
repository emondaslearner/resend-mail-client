import { NextResponse } from "next/server";
import { ResendApiError } from "@/lib/resend/server";
import { isAuthorized } from "@/lib/auth/server";
import type { AccountRequest } from "@/lib/resend/types";

export type AccountBody = {
  account?: AccountRequest;
};

export async function readAccountBody<T extends AccountBody>(request: Request): Promise<T> {
  if (!isAuthorized(request)) {
    throw new ResendApiError("Unauthorized: inbox password required.", 401);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    throw new ResendApiError("Request body must be JSON.", 400);
  }

  const account = (body as AccountBody).account;
  if (!account || (account.source !== "env" && account.source !== "local")) {
    throw new ResendApiError("A valid account is required.", 400);
  }

  return body as T;
}

export function jsonOk<T>(data: T) {
  return NextResponse.json(data);
}

export function jsonError(error: unknown) {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error && "message" in error
      ? String(error.message)
      : String(error);
  const status = error instanceof ResendApiError
    ? error.statusCode
    : typeof error === "object" && error && "statusCode" in error
      ? Number(error.statusCode) || 500
      : 500;
  return NextResponse.json({ error: message }, { status });
}
