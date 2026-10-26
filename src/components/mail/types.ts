import type {
  AccountInfo,
  AccountRequest,
  EmailDetail,
  EmailSummary,
} from "@/lib/resend/types";

export type MailAccount = {
  id: string;
  label: string;
  source: "env" | "local";
  apiKey?: string;
  fromAddress?: string;
  createdAt: string;
};

export type Mailbox = "inbox" | "sent";

export type MailSettings = {
  autoCheckEnabled: boolean;
  defaultSenderName?: string;
  defaultSenderEmail?: string;
};

export type MailState = {
  accounts: MailAccount[];
  activeAccountId: string | null;
  mailbox: Mailbox;
  messages: EmailSummary[];
  selectedMessage: EmailDetail | null;
  accountInfo: AccountInfo | null;
  loading: boolean;
  loadingMessage: boolean;
  error: string | null;
};

export type EnvAccount = {
  available: boolean;
  label: string;
  fromAddress: string | null;
};

export type AttachmentPayload = {
  filename: string;
  content: string; // base64
  contentType: string;
  size?: number;
};

export type ReplyPayload = {
  html: string;
  text: string;
  from?: string;
  attachments?: AttachmentPayload[];
};

export const INITIAL_STATE: MailState = {
  accounts: [],
  activeAccountId: null,
  mailbox: "inbox",
  messages: [],
  selectedMessage: null,
  accountInfo: null,
  loading: false,
  loadingMessage: false,
  error: null,
};

export function toAccountRequest(account: MailAccount): AccountRequest {
  return {
    source: account.source,
    apiKey: account.apiKey,
    fromAddress: account.fromAddress,
  };
}
