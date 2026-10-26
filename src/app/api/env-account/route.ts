import { jsonError, jsonOk } from "@/lib/resend/route-utils";
import { ResendApiError } from "@/lib/resend/server";
import { isAuthorized } from "@/lib/auth/server";

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError(new ResendApiError("Unauthorized: inbox password required.", 401));
  }

  const apiKey = process.env.RESEND_FULL_ACCESS || process.env.RESEND_API_KEY || "";
  const fromAddress = process.env.RESEND_FROM_EMAIL || "";

  return jsonOk({
    available: Boolean(apiKey.trim()),
    label: "Environment account",
    fromAddress: fromAddress.trim() || null,
  });
}
