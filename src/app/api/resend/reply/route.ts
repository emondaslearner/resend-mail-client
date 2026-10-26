import {
  appendReference,
  ensureReSubject,
  loadAccountInfo,
  makeClient,
  normalizeReferences,
  resolveFromAddress,
} from "@/lib/resend/server";
import { jsonError, jsonOk, readAccountBody } from "@/lib/resend/route-utils";
import type { AccountRequest, SendReplyResponse } from "@/lib/resend/types";

type AttachmentInput = {
  filename: string;
  content: string;
  contentType?: string;
};

type Body = {
  account: AccountRequest;
  emailId?: string;
  text?: string;
  html?: string;
  attachments?: AttachmentInput[];
};

export async function POST(request: Request) {
  try {
    const body = await readAccountBody<Body>(request);
    if (!body.emailId?.trim()) throw new Error("Email id is required.");
    if (!body.text?.trim() && !body.html?.trim()) {
      throw new Error("Reply content is required.");
    }

    const resend = makeClient(body.account);
    const inbound = await resend.emails.receiving.get(body.emailId.trim());
    if (inbound.error || !inbound.data) throw inbound.error;

    const info = await loadAccountInfo(body.account);
    const from = resolveFromAddress(body.account, info);
    const recipient = inbound.data.reply_to?.[0]?.trim() || inbound.data.from;
    const inReplyTo = inbound.data.message_id?.trim() || null;
    const references = appendReference(
      normalizeReferences(inbound.data.headers?.references),
      inReplyTo,
    );

    const attachments = (body.attachments || []).map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "base64"),
      contentType: att.contentType,
    }));

    const response = await resend.emails.send({
      from,
      to: [recipient],
      subject: ensureReSubject(inbound.data.subject),
      text: body.text?.trim() || "",
      ...(body.html ? { html: body.html } : {}),
      ...(attachments.length > 0 ? { attachments } : {}),
      headers: {
        ...(inReplyTo ? { "In-Reply-To": inReplyTo } : {}),
        ...(references ? { References: references } : {}),
      },
    });

    if (response.error || !response.data?.id) {
      throw response.error || new Error("Reply was not accepted by Resend.");
    }

    const payload: SendReplyResponse = { id: response.data.id };
    return jsonOk(payload);
  } catch (error) {
    return jsonError(error);
  }
}
