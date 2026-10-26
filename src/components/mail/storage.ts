"use client";

import type { MailAccount, MailSettings } from "@/components/mail/types";

const STORAGE_KEY = "resend-mail-client.accounts.v1";
const ACTIVE_KEY = "resend-mail-client.active-account.v1";
const READ_STATE_KEY = "resend-mail-client.read-state.v1";
const MANUAL_SENT_STATE_KEY = "resend-mail-client.manual-sent-state.v1";
const SETTINGS_KEY = "resend-mail-client.settings.v1";

export const DEFAULT_SETTINGS: MailSettings = {
  autoCheckEnabled: true,
  defaultSenderName: "Antar",
};

function safeParseAccounts(value: string | null): MailAccount[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((account): account is MailAccount => (
      typeof account?.id === "string" &&
      typeof account?.label === "string" &&
      (account.source === "env" || account.source === "local")
    ));
  } catch {
    return [];
  }
}

export function loadStoredAccounts(): MailAccount[] {
  if (typeof window === "undefined") return [];
  return safeParseAccounts(window.localStorage.getItem(STORAGE_KEY));
}

export function saveStoredAccounts(accounts: MailAccount[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function loadActiveAccountId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveAccountId(accountId: string | null) {
  if (!accountId) {
    window.localStorage.removeItem(ACTIVE_KEY);
    return;
  }
  window.localStorage.setItem(ACTIVE_KEY, accountId);
}

function safeParseMessageState(value: string | null): Record<string, string[]> {
  if (!value) return {};

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter((entry): entry is [string, unknown[]] => (
          typeof entry[0] === "string" && Array.isArray(entry[1])
        ))
        .map(([accountId, ids]) => [
          accountId,
          ids.filter((id): id is string => typeof id === "string"),
        ]),
    );
  } catch {
    return {};
  }
}

export function loadReadState(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  return safeParseMessageState(window.localStorage.getItem(READ_STATE_KEY));
}

export function saveReadState(readState: Record<string, string[]>) {
  window.localStorage.setItem(READ_STATE_KEY, JSON.stringify(readState));
}

export function loadManualSentState(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  return safeParseMessageState(window.localStorage.getItem(MANUAL_SENT_STATE_KEY));
}

export function saveManualSentState(manualSentState: Record<string, string[]>) {
  window.localStorage.setItem(MANUAL_SENT_STATE_KEY, JSON.stringify(manualSentState));
}

export function loadSettings(): MailSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const value = window.localStorage.getItem(SETTINGS_KEY);
  if (!value) return DEFAULT_SETTINGS;

  try {
    const parsed = JSON.parse(value);
    return {
      autoCheckEnabled: typeof parsed?.autoCheckEnabled === "boolean"
        ? parsed.autoCheckEnabled
        : DEFAULT_SETTINGS.autoCheckEnabled,
      defaultSenderName: typeof parsed?.defaultSenderName === "string" && parsed.defaultSenderName.trim()
        ? parsed.defaultSenderName.trim()
        : "Antar",
      defaultSenderEmail: typeof parsed?.defaultSenderEmail === "string" ? parsed.defaultSenderEmail : undefined,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: MailSettings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function maskKey(apiKey?: string): string {
  if (!apiKey) return "env";
  if (apiKey.length <= 12) return "saved locally";
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
}
