import { loadAccountInfo } from "@/lib/resend/server";
import { jsonError, jsonOk, readAccountBody } from "@/lib/resend/route-utils";
import type { AccountRequest } from "@/lib/resend/types";

type Body = {
  account: AccountRequest;
};

export async function POST(request: Request) {
  try {
    const body = await readAccountBody<Body>(request);
    const info = await loadAccountInfo(body.account);
    return jsonOk(info);
  } catch (error) {
    return jsonError(error);
  }
}
