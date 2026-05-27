"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { MarkAllReadDialog } from "@/components/mail/mark-all-read-dialog";
import { MessageList } from "@/components/mail/message-list";
import { MessageView } from "@/components/mail/message-view";
import { NoticeBanner } from "@/components/mail/notice-banner";
import { SettingsDialog } from "@/components/mail/settings-dialog";
import { Sidebar } from "@/components/mail/sidebar";
import {
  DEFAULT_SETTINGS,
  loadActiveAccountId,
  loadManualSentState,
  loadReadState,
  loadSettings,
  loadStoredAccounts,
  saveActiveAccountId,
  saveManualSentState,
  saveReadState,
  saveSettings,
  saveStoredAccounts,
} from "@/components/mail/storage";
import type { MailAccount, MailSettings, MailState, Mailbox } from "@/components/mail/types";

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

type RefreshOptions = { silent?: boolean };
export function MailClient() {
  const [state, setState] = useState<MailState>(INITIAL_STATE);
  const [envAccount, setEnvAccount] = useState<EnvAccount | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [markAllReadOpen, setMarkAllReadOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [settings, setSettings] = useState<MailSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [readState, setReadState] = useState<Record<string, string[]>>({});
  const [readStateLoaded, setReadStateLoaded] = useState(false);
  const [manualSentState, setManualSentState] = useState<Record<string, string[]>>({});
  const [manualSentStateLoaded, setManualSentStateLoaded] = useState(false);

  const activeAccount = useMemo(
    () => state.accounts.find((account) => account.id === state.activeAccountId) || null,
    [state.accounts, state.activeAccountId],
  );
  const activeReadIds = useMemo(() => (
    new Set(activeAccount ? readState[activeAccount.id] || [] : [])
  ), [activeAccount, readState]);
  const activeManualSentIds = useMemo(() => (
    new Set(activeAccount ? manualSentState[activeAccount.id] || [] : [])
  ), [activeAccount, manualSentState]);
  const unreadCount = state.mailbox === "inbox"
    ? state.messages.filter((message) => !activeReadIds.has(message.id)).length
    : 0;

  useEffect(() => {
    const stored = loadStoredAccounts();
    const activeId = loadActiveAccountId();
    setSettings(loadSettings());
    setReadState(loadReadState());
    setManualSentState(loadManualSentState());
    setSettingsLoaded(true);
    setReadStateLoaded(true);
    setManualSentStateLoaded(true);
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

  useEffect(() => {
    if (!settingsLoaded) return;
    saveSettings(settings);
  }, [settings, settingsLoaded]);

  useEffect(() => {
    if (!readStateLoaded) return;
    saveReadState(readState);
  }, [readState, readStateLoaded]);

  useEffect(() => {
    if (!manualSentStateLoaded) return;
    saveManualSentState(manualSentState);
  }, [manualSentState, manualSentStateLoaded]);

  const refresh = useCallback(async (
    account: MailAccount | null = activeAccount,
    mailbox: Mailbox = state.mailbox,
    options: RefreshOptions = {},
  ) => {
    if (!account) return;
    if (!options.silent) {
      setState((current) => ({
        ...current,
        loading: true,
        selectedMessage: null,
        error: null,
      }));
    }

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
      if (options.silent) return;
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

  useEffect(() => {
    if (!settings.autoCheckEnabled || !activeAccount || state.loading) return;
    let checking = false;
    const interval = window.setInterval(() => {
      if (checking) return;
      checking = true;
      void refresh(activeAccount, state.mailbox, { silent: true })
        .finally(() => {
          checking = false;
        });
    }, 60_000);
    return () => window.clearInterval(interval);
  }, [activeAccount, refresh, settings.autoCheckEnabled, state.loading, state.mailbox]);

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
    setReadState((current) => {
      const next = { ...current };
      delete next[accountId];
      return next;
    });
    setManualSentState((current) => {
      const next = { ...current };
      delete next[accountId];
      return next;
    });
  }

  function setMessageRead(emailId: string, read: boolean) {
    if (!activeAccount || state.mailbox !== "inbox") return;

    setReadState((current) => {
      const nextIds = new Set(current[activeAccount.id] || []);
      if (read) {
        nextIds.add(emailId);
      } else {
        nextIds.delete(emailId);
      }
      return {
        ...current,
        [activeAccount.id]: Array.from(nextIds),
      };
    });
  }

  function setMessageManuallySent(emailId: string) {
    if (!activeAccount) return;

    setManualSentState((current) => {
      const nextIds = new Set(current[activeAccount.id] || []);
      nextIds.add(emailId);
      return {
        ...current,
        [activeAccount.id]: Array.from(nextIds),
      };
    });
  }

  function markAllRead() {
    if (!activeAccount || state.mailbox !== "inbox") return;

    setReadState((current) => {
      const nextIds = new Set(current[activeAccount.id] || []);
      state.messages.forEach((message) => nextIds.add(message.id));
      return {
        ...current,
        [activeAccount.id]: Array.from(nextIds),
      };
    });
    setMarkAllReadOpen(false);
    setNotice("All inbox messages marked as read.");
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
      setMessageRead(emailId, true);
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
    setMessageManuallySent(result.id);
    setNotice(`Reply sent: ${result.id}`);
    await refresh(activeAccount, state.mailbox);
  }

  function changeMailbox(mailbox: Mailbox) {
    if (mailbox === state.mailbox) {
      if (!state.loading) void refresh(activeAccount, mailbox);
      return;
    }

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
        unreadCount={unreadCount}
        onSelectAccount={(id) => setState((current) => ({ ...current, activeAccountId: id }))}
        onMailboxChange={changeMailbox}
        onAddAccount={() => setAddOpen(true)}
        onShowInfo={() => setDetailsOpen(true)}
        onShowSettings={() => setSettingsOpen(true)}
        onRemoveAccount={removeAccount}
      />
      <MessageList
        messages={state.messages}
        selectedId={state.selectedMessage?.id}
        mailbox={state.mailbox}
        loading={state.loading}
        readIds={activeReadIds}
        manualSentIds={activeManualSentIds}
        onMarkAllRead={() => setMarkAllReadOpen(true)}
        onSelect={(id) => void selectMessage(id)}
      />
      <div className="relative flex min-w-0 flex-1">
        <NoticeBanner
          error={state.error}
          notice={notice}
          onClose={() => {
            setNotice(null);
            setState((current) => ({ ...current, error: null }));
          }}
        />
        <MessageView
          message={state.selectedMessage}
          mailbox={state.mailbox}
          loading={state.loadingMessage}
          isRead={state.selectedMessage ? activeReadIds.has(state.selectedMessage.id) : true}
          isManuallySent={state.selectedMessage ? activeManualSentIds.has(state.selectedMessage.id) : false}
          onShowInfo={() => setDetailsOpen(true)}
          onToggleRead={() => {
            if (!state.selectedMessage) return;
            setMessageRead(state.selectedMessage.id, !activeReadIds.has(state.selectedMessage.id));
          }}
          onSendReply={reply}
        />
      </div>

      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addAccount} />
      <MarkAllReadDialog
        open={markAllReadOpen}
        onOpenChange={setMarkAllReadOpen}
        onConfirm={markAllRead}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
      />
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
