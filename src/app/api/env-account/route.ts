import { jsonOk } from "@/lib/resend/route-utils";

export async function GET() {
  const apiKey = process.env.RESEND_FULL_ACCESS || process.env.RESEND_API_KEY || "";
  const fromAddress = process.env.RESEND_FROM_EMAIL || "";

  return jsonOk({
    available: Boolean(apiKey.trim()),
    label: "Environment account",
    fromAddress: fromAddress.trim() || null,
  });
}
