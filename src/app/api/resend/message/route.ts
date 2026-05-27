import { makeClient, toEmailDetail } from "@/lib/resend/server";
import { jsonError, jsonOk, readAccountBody } from "@/lib/resend/route-utils";
import type { AccountRequest } from "@/lib/resend/types";

type Body = {
  account: AccountRequest;
  emailId?: string;
  mailbox?: "inbox" | "sent";
};

export async function POST(request: Request) {
  try {
    const body = await readAccountBody<Body>(request);
    if (!body.emailId?.trim()) {
      throw new Error("Email id is required.");
    }

    const resend = makeClient(body.account);
    const emailId = body.emailId.trim();

    if (body.mailbox === "sent") {
      const response = await resend.emails.get(emailId);
      if (response.error || !response.data) {
        throw response.error;
      }

      return jsonOk(toEmailDetail({
        ...response.data,
        message_id: undefined,
        headers: {},
        raw: null,
        attachments: [],
      }));
    }

    const response = await resend.emails.receiving.get(emailId);

    if (response.error || !response.data) {
      throw response.error;
    }

    return jsonOk(toEmailDetail(response.data));
  } catch (error) {
    return jsonError(error);
  }
}
