import { makeClient, toEmailSummary } from "@/lib/resend/server";
import { jsonError, jsonOk, readAccountBody } from "@/lib/resend/route-utils";
import type { AccountRequest, SentResponse } from "@/lib/resend/types";

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
    const response = await resend.emails.list({ limit, ...pagination });

    if (response.error || !response.data) {
      throw response.error;
    }

    const payload: SentResponse = {
      emails: response.data.data.map((email) => toEmailSummary({
        ...email,
        attachments: [],
      })),
      hasMore: response.data.has_more,
    };

    return jsonOk(payload);
  } catch (error) {
    return jsonError(error);
  }
}
