export type AccountSource = "env" | "local";

export type AccountRequest = {
  source: AccountSource;
  apiKey?: string;
  fromAddress?: string;
};

export type DomainInfo = {
  id: string;
  name: string;
  status: string;
  region?: string;
  sending: string;
  receiving: string;
};

export type ApiKeyInfo = {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type AccountInfo = {
  domains: DomainInfo[];
  apiKeys: ApiKeyInfo[];
  suggestedFrom: string | null;
  warnings: string[];
};

export type EmailSummary = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  createdAt: string;
  cc: string[];
  bcc: string[];
  replyTo: string[];
  messageId?: string;
  attachmentsCount: number;
};

export type EmailDetail = EmailSummary & {
  text: string | null;
  html: string | null;
  headers: Record<string, string>;
  rawDownloadUrl: string | null;
  attachments: {
    id: string;
    filename: string | null;
    size: number;
    contentType: string;
  }[];
};

export type InboxResponse = {
  emails: EmailSummary[];
  hasMore: boolean;
};

export type SentResponse = {
  emails: EmailSummary[];
  hasMore: boolean;
};

export type SendReplyResponse = {
  id: string;
};
