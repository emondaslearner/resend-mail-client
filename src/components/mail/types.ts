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

export function toAccountRequest(account: MailAccount): AccountRequest {
  return {
    source: account.source,
    apiKey: account.apiKey,
    fromAddress: account.fromAddress,
  };
}
