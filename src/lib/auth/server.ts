import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "inbox_session";

export function getInboxPassword(): string | null {
  const pwd = process.env.INBOX_PASSWORD?.trim();
  return pwd || null;
}

export function isPasswordProtected(): boolean {
  return Boolean(getInboxPassword());
}

export function getExpectedToken(): string | null {
  const password = getInboxPassword();
  if (!password) return null;
  return crypto.createHmac("sha256", password).update("inbox_team_access_v1").digest("hex");
}

export function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isAuthorized(request: Request): boolean {
  if (!isPasswordProtected()) return true;

  const headerPwd = request.headers.get("x-inbox-password");
  if (headerPwd && headerPwd === getInboxPassword()) {
    return true;
  }

  const token = parseCookie(request.headers.get("cookie"), AUTH_COOKIE_NAME);
  if (!token) return false;

  return token === getExpectedToken();
}

export function verifyPassword(input: string): boolean {
  const password = getInboxPassword();
  if (!password) return true;
  if (!input) return false;

  const bufA = Buffer.from(input);
  const bufB = Buffer.from(password);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function setAuthCookie(response: NextResponse): void {
  const token = getExpectedToken();
  if (!token) return;
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE_NAME);
}
