"use client";

import type {
  AccountInfo,
  EmailDetail,
  InboxResponse,
  SendReplyResponse,
  SentResponse,
} from "@/lib/resend/types";
import {
  toAccountRequest,
  type AttachmentPayload,
  type EnvAccount,
  type MailAccount,
  type Mailbox,
} from "@/components/mail/types";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }

  return data as T;
}

export async function loadEnvAccount(): Promise<EnvAccount> {
  const response = await fetch("/api/env-account");
  if (!response.ok) throw new Error("Unable to inspect environment account.");
  return response.json();
}

export async function loadAccountInfo(account: MailAccount): Promise<AccountInfo> {
  return postJson<AccountInfo>("/api/resend/account", {
    account: toAccountRequest(account),
  });
}

export async function loadInbox(account: MailAccount): Promise<InboxResponse> {
  return postJson<InboxResponse>("/api/resend/inbox", {
    account: toAccountRequest(account),
    limit: 50,
  });
}

export async function loadSent(account: MailAccount): Promise<SentResponse> {
  return postJson<SentResponse>("/api/resend/sent", {
    account: toAccountRequest(account),
    limit: 50,
  });
}

export async function loadMessage(
  account: MailAccount,
  emailId: string,
  mailbox: Mailbox,
): Promise<EmailDetail> {
  return postJson<EmailDetail>("/api/resend/message", {
    account: toAccountRequest(account),
    emailId,
    mailbox,
  });
}

export async function sendReply(
  account: MailAccount,
  emailId: string,
  text: string,
  html?: string,
  attachments?: AttachmentPayload[],
  from?: string,
): Promise<SendReplyResponse> {
  return postJson<SendReplyResponse>("/api/resend/reply", {
    account: toAccountRequest(account),
    emailId,
    text,
    html,
    attachments,
    from,
  });
}
