import { NextResponse } from "next/server";
import { setAuthCookie, verifyPassword } from "@/lib/auth/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = String(body.password || "");

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ ok: true });
    setAuthCookie(response);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to verify password." },
      { status: 500 },
    );
  }
}

