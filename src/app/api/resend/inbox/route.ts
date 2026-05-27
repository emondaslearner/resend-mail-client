import { makeClient, toEmailSummary } from "@/lib/resend/server";
import { jsonError, jsonOk, readAccountBody } from "@/lib/resend/route-utils";
import type { AccountRequest, InboxResponse } from "@/lib/resend/types";

type Body = {
  account: AccountRequest;
  limit?: number;
  after?: string;
  before?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readAccountBody<Body>(request);
    const resend = makeClient(body.account);
    const limit = Math.min(Math.max(Number(body.limit) || 25, 1), 100);
    const pagination = body.after ? { after: body.after } : body.before ? { before: body.before } : {};
    const response = await resend.emails.receiving.list({ limit, ...pagination });

    if (response.error || !response.data) {
      throw response.error;
    }

    const payload: InboxResponse = {
      emails: response.data.data.map(toEmailSummary),
      hasMore: response.data.has_more,
    };

    return jsonOk(payload);
  } catch (error) {
    return jsonError(error);
  }
}
