import { Resend } from "resend";
import type {
  AccountInfo,
  AccountRequest,
  DomainInfo,
  EmailDetail,
  EmailSummary,
} from "@/lib/resend/types";

type ResendErrorLike = {
  message?: string;
  statusCode?: number | null;
  name?: string;
};

export class ResendApiError extends Error {
  statusCode: number;

  constructor(error: ResendErrorLike | string, statusCode = 400) {
    const message = typeof error === "string" ? error : error.message;
    super(message || "Resend API request failed");
    this.statusCode = typeof error === "string" ? statusCode : error.statusCode || statusCode;
  }
}

export function resolveApiKey(account: AccountRequest): string {
  if (account.source === "env") {
    const key = process.env.RESEND_FULL_ACCESS || process.env.RESEND_API_KEY || "";
    if (!key.trim()) {
      throw new ResendApiError("No Resend API key found in .env.", 401);
    }
    return key.trim();
  }

  if (!account.apiKey?.trim()) {
    throw new ResendApiError("This account is missing a Resend API key.", 401);
  }
  return account.apiKey.trim();
}

export function makeClient(account: AccountRequest): Resend {
  return new Resend(resolveApiKey(account));
}

export function resolveFromAddress(
  account: AccountRequest,
  info?: AccountInfo,
  customFrom?: string,
): string {
  const custom = customFrom?.trim();
  if (custom) return custom;

  const explicit = account.fromAddress?.trim() || process.env.RESEND_FROM_EMAIL?.trim();
  if (explicit) return explicit;

  const verified = info?.domains.find((domain) => (
    domain.status === "verified" && domain.sending === "enabled"
  ));
  if (verified) return `Mail <support@${verified.name}>`;

  throw new ResendApiError("Set a sender address before replying.", 400);
}

export function normalizeReferences(value: unknown): string | null {
  if (Array.isArray(value)) {
    const joined = value.map(String).map((item) => item.trim()).filter(Boolean).join(" ");
    return joined || null;
  }

  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (!trimmed.startsWith("[")) return trimmed;

  try {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return trimmed;
    const joined = parsed.map(String).map((item) => item.trim()).filter(Boolean).join(" ");
    return joined || null;
  } catch {
    return trimmed;
  }
}

export function ensureReSubject(subject: string): string {
  const value = subject.trim();
  if (!value) return "Re:";
  return /^re:/i.test(value) ? value : `Re: ${value}`;
}

export function appendReference(base: string | null, messageId: string | null): string | null {
  if (!messageId) return base;
  if (!base) return messageId;
  return `${base} ${messageId}`;
}

function stringArray(value: string[] | null | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

export function toEmailSummary(input: {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  cc?: string[] | null;
  bcc?: string[] | null;
  reply_to?: string[] | null;
  message_id?: string;
  attachments?: unknown[];
}): EmailSummary {
  return {
    id: input.id,
    from: input.from,
    to: input.to,
    subject: input.subject || "(no subject)",
    createdAt: input.created_at,
    cc: stringArray(input.cc),
    bcc: stringArray(input.bcc),
    replyTo: stringArray(input.reply_to),
    messageId: input.message_id,
    attachmentsCount: Array.isArray(input.attachments) ? input.attachments.length : 0,
  };
}

export function toEmailDetail(input: {
  id: string;
  from: string;
  to: string[];
  subject: string;
  created_at: string;
  cc?: string[] | null;
  bcc?: string[] | null;
  reply_to?: string[] | null;
  message_id?: string;
  text?: string | null;
  html?: string | null;
  headers?: Record<string, string> | null;
  raw?: { download_url?: string | null } | null;
  attachments?: {
    id: string;
    filename: string | null;
    size: number;
    content_type: string;
  }[];
}): EmailDetail {
  const summary = toEmailSummary(input);
  return {
    ...summary,
    text: input.text || null,
    html: input.html || null,
    headers: input.headers || {},
    rawDownloadUrl: input.raw?.download_url || null,
    attachments: (input.attachments || []).map((attachment) => ({
      id: attachment.id,
      filename: attachment.filename,
      size: attachment.size,
      contentType: attachment.content_type,
    })),
  };
}

export async function loadAccountInfo(account: AccountRequest): Promise<AccountInfo> {
  const resend = makeClient(account);
  const [domainsResult, keysResult] = await Promise.allSettled([
    resend.domains.list({ limit: 100 }),
    resend.apiKeys.list({ limit: 100 }),
  ]);

  const warnings: string[] = [];
  const domains: DomainInfo[] = [];
  const apiKeys = [];

  if (domainsResult.status === "fulfilled" && domainsResult.value.data) {
    domains.push(...domainsResult.value.data.data.map((domain) => ({
      id: domain.id,
      name: domain.name,
      status: domain.status,
      region: domain.region,
      sending: domain.capabilities.sending,
      receiving: domain.capabilities.receiving,
    })));
  } else {
    warnings.push("Domains are not available for this key.");
  }

  if (keysResult.status === "fulfilled" && keysResult.value.data) {
    apiKeys.push(...keysResult.value.data.data.map((key) => ({
      id: key.id,
      name: key.name,
      createdAt: key.created_at,
      lastUsedAt: key.last_used_at,
    })));
  } else {
    warnings.push("API key metadata is not available for this key.");
  }

  const suggestedDomain = domains.find((domain) => (
    domain.status === "verified" && domain.sending === "enabled"
  ));

  return {
    domains,
    apiKeys,
    suggestedFrom: process.env.RESEND_FROM_EMAIL?.trim() || (
      suggestedDomain ? `Mail <support@${suggestedDomain.name}>` : null
    ),
    warnings,
  };
}
