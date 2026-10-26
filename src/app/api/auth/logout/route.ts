import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAuthCookie(response);
  return response;
}
