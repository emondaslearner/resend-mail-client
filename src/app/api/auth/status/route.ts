import { NextResponse } from "next/server";
import { isAuthorized, isPasswordProtected } from "@/lib/auth/server";

export async function GET(request: Request) {
  const required = isPasswordProtected();
  const authenticated = isAuthorized(request);

  return NextResponse.json({
    required,
    authenticated,
  });
}

