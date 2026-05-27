"use client";

import type { MailAccount } from "@/components/mail/types";

const STORAGE_KEY = "resend-mail-client.accounts.v1";
const ACTIVE_KEY = "resend-mail-client.active-account.v1";

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

export function maskKey(apiKey?: string): string {
  if (!apiKey) return "env";
  if (apiKey.length <= 12) return "saved locally";
  return `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`;
}
