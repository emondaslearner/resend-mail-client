"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AddAccountDialog } from "@/components/mail/add-account-dialog";
import { ApiDetails } from "@/components/mail/api-details";
import {
  loadAccountInfo,
  loadEnvAccount,
  loadInbox,
  loadMessage,
  loadSent,
  sendReply,
} from "@/components/mail/api";
import { EmptyStart } from "@/components/mail/empty-start";
import { MessageList } from "@/components/mail/message-list";
import { MessageView } from "@/components/mail/message-view";
import { Sidebar } from "@/components/mail/sidebar";
import {
  loadActiveAccountId,
  loadStoredAccounts,
  saveActiveAccountId,
  saveStoredAccounts,
} from "@/components/mail/storage";
import type { MailAccount, MailState, Mailbox } from "@/components/mail/types";

const INITIAL_STATE: MailState = {
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

type EnvAccount = {
  available: boolean;
  label: string;
  fromAddress: string | null;
};

export function MailClient() {
  const [state, setState] = useState<MailState>(INITIAL_STATE);
  const [envAccount, setEnvAccount] = useState<EnvAccount | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const activeAccount = useMemo(
    () => state.accounts.find((account) => account.id === state.activeAccountId) || null,
    [state.accounts, state.activeAccountId],
  );

  useEffect(() => {
    const stored = loadStoredAccounts();
    const activeId = loadActiveAccountId();
    setState((current) => ({
      ...current,
      accounts: stored,
      activeAccountId: activeId && stored.some((account) => account.id === activeId)
        ? activeId
        : stored[0]?.id || null,
    }));

    loadEnvAccount()
      .then(setEnvAccount)
      .catch(() => setEnvAccount({ available: false, label: "Environment account", fromAddress: null }));
  }, []);

  useEffect(() => {
    saveStoredAccounts(state.accounts);
    saveActiveAccountId(state.activeAccountId);
  }, [state.accounts, state.activeAccountId]);

  const refresh = useCallback(async (
    account: MailAccount | null = activeAccount,
    mailbox: Mailbox = state.mailbox,
  ) => {
    if (!account) return;
    setState((current) => ({
      ...current,
      loading: true,
      selectedMessage: null,
      error: null,
    }));

    try {
      const [info, messages] = await Promise.all([
        loadAccountInfo(account),
        mailbox === "inbox" ? loadInbox(account) : loadSent(account),
      ]);
      setState((current) => ({
        ...current,
        accountInfo: info,
        messages: messages.emails,
        loading: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        messages: [],
        accountInfo: null,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }, [activeAccount, state.mailbox]);

  useEffect(() => {
    if (!activeAccount) return;
    void refresh(activeAccount, state.mailbox);
  }, [activeAccount, refresh, state.mailbox]);

  function addEnvAccount() {
    if (!envAccount?.available) return;
    const account: MailAccount = {
      id: "env",
      label: envAccount.label,
      source: "env",
      fromAddress: envAccount.fromAddress || undefined,
      createdAt: new Date().toISOString(),
    };
    setState((current) => {
      const accounts = current.accounts.some((item) => item.id === account.id)
        ? current.accounts
        : [account, ...current.accounts];
      return { ...current, accounts, activeAccountId: account.id };
    });
  }

  function addAccount(account: MailAccount) {
    setState((current) => ({
      ...current,
      accounts: [...current.accounts, account],
      activeAccountId: account.id,
    }));
  }

  function removeAccount(accountId: string) {
    setState((current) => {
      const accounts = current.accounts.filter((account) => account.id !== accountId);
      return {
        ...current,
        accounts,
        activeAccountId: current.activeAccountId === accountId
          ? accounts[0]?.id || null
          : current.activeAccountId,
        selectedMessage: null,
      };
    });
  }

  async function selectMessage(emailId: string) {
    if (!activeAccount) return;
    setState((current) => ({ ...current, loadingMessage: true, error: null }));
    try {
      const message = await loadMessage(activeAccount, emailId, state.mailbox);
      setState((current) => ({
        ...current,
        selectedMessage: message,
        loadingMessage: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        loadingMessage: false,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }

  async function reply(text: string) {
    if (!activeAccount || !state.selectedMessage) return;
    const result = await sendReply(activeAccount, state.selectedMessage.id, text);
    setNotice(`Reply sent: ${result.id}`);
    await refresh(activeAccount, state.mailbox);
  }

  function changeMailbox(mailbox: Mailbox) {
    setState((current) => ({ ...current, mailbox, selectedMessage: null }));
  }

  if (state.accounts.length === 0) {
    return (
      <>
        <EmptyStart
          envAvailable={Boolean(envAccount?.available)}
          onUseEnv={addEnvAccount}
          onAddAccount={() => setAddOpen(true)}
        />
        <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addAccount} />
      </>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white text-foreground">
      <Sidebar
        accounts={state.accounts}
        activeAccountId={state.activeAccountId}
        mailbox={state.mailbox}
        loading={state.loading}
        onSelectAccount={(id) => setState((current) => ({ ...current, activeAccountId: id }))}
        onMailboxChange={changeMailbox}
        onAddAccount={() => setAddOpen(true)}
        onRefresh={() => void refresh()}
        onShowInfo={() => setDetailsOpen(true)}
        onRemoveAccount={removeAccount}
      />
      <MessageList
        messages={state.messages}
        selectedId={state.selectedMessage?.id}
        mailbox={state.mailbox}
        loading={state.loading}
        onSelect={(id) => void selectMessage(id)}
      />
      <div className="relative flex min-w-0 flex-1">
        {(state.error || notice) ? (
          <div className="absolute left-4 right-4 top-3 z-10 flex items-center justify-between rounded-[8px] border bg-white px-4 py-2 text-sm shadow-sm">
            <span className={state.error ? "text-destructive" : "text-emerald-700"}>
              {state.error || notice}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 cursor-pointer"
              onClick={() => {
                setNotice(null);
                setState((current) => ({ ...current, error: null }));
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
        <MessageView
          message={state.selectedMessage}
          mailbox={state.mailbox}
          loading={state.loadingMessage}
          onShowInfo={() => setDetailsOpen(true)}
          onSendReply={reply}
        />
      </div>

      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addAccount} />
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full p-0 sm:max-w-xl">
          <SheetHeader className="border-b p-4">
            <SheetTitle>API information</SheetTitle>
          </SheetHeader>
          <ApiDetails accountInfo={state.accountInfo} message={state.selectedMessage} />
        </SheetContent>
      </Sheet>
    </main>
  );
}
