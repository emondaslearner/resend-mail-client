"use client";

import {
  Inbox,
  Info,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { MailAccount, Mailbox } from "@/components/mail/types";
import { maskKey } from "@/components/mail/storage";
import { cn } from "@/lib/utils";

type SidebarProps = {
  accounts: MailAccount[];
  activeAccountId: string | null;
  mailbox: Mailbox;
  loading: boolean;
  unreadCount: number;
  onSelectAccount: (id: string) => void;
  onMailboxChange: (mailbox: Mailbox) => void;
  onAddAccount: () => void;
  onShowInfo: () => void;
  onShowSettings: () => void;
  onRemoveAccount: (id: string) => void;
  onLock?: () => void;
};

export function Sidebar(props: SidebarProps) {
  const activeAccount = props.accounts.find((account) => account.id === props.activeAccountId);
  const loadingInbox = props.loading && props.mailbox === "inbox";
  const loadingSent = props.loading && props.mailbox === "sent";
  const mailboxButtonClass = (selected: boolean) => cn(
    "h-10 w-full justify-start rounded-[8px] px-3 cursor-pointer",
    selected
      ? "bg-[#d3e3fd] font-semibold text-[#001d35] shadow-sm hover:bg-[#d3e3fd]"
      : "text-slate-800 hover:bg-white/80",
  );

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col border-r bg-[#f6f8fc] p-3">
      <div className="mb-3 flex items-center gap-2 px-2">
        <div className="flex size-10 items-center justify-center rounded-[8px] bg-blue-600 text-white">
          <Inbox className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Resend Mail</div>
          <div className="truncate text-xs text-muted-foreground">
            {activeAccount?.label || "No account"}
          </div>
        </div>
      </div>

      <Button className="mb-3 justify-start cursor-pointer" onClick={props.onAddAccount}>
        <Plus className="size-4" />
        Add account
      </Button>

      <nav className="space-y-1">
        <Button
          className={mailboxButtonClass(props.mailbox === "inbox")}
          variant="ghost"
          aria-current={props.mailbox === "inbox" ? "page" : undefined}
          onClick={() => props.onMailboxChange("inbox")}
        >
          {loadingInbox ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Inbox className="size-4" />
          )}
          <span className="flex-1 text-left">Inbox</span>
          {props.unreadCount > 0 ? (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
              {props.unreadCount}
            </span>
          ) : null}
        </Button>
        <Button
          className={mailboxButtonClass(props.mailbox === "sent")}
          variant="ghost"
          aria-current={props.mailbox === "sent" ? "page" : undefined}
          onClick={() => props.onMailboxChange("sent")}
        >
          {loadingSent ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          <span className="flex-1 text-left">Sent</span>
        </Button>
        <Button
          className="w-full justify-start cursor-pointer"
          variant="ghost"
          onClick={props.onShowInfo}
          disabled={!activeAccount}
        >
          <Info className="size-4" />
          API info
        </Button>
        <Button
          className="w-full justify-start cursor-pointer"
          variant="ghost"
          onClick={props.onShowSettings}
        >
          <Settings className="size-4" />
          Settings
        </Button>
        {props.onLock ? (
          <Button
            className="w-full justify-start cursor-pointer text-slate-700 hover:text-slate-900"
            variant="ghost"
            onClick={props.onLock}
          >
            <Lock className="size-4" />
            Lock inbox
          </Button>
        ) : null}
      </nav>

      <Separator className="my-4" />

      <div className="mb-2 px-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
        Accounts
      </div>
      <div className="space-y-1 overflow-auto pr-1">
        {props.accounts.map((account) => {
          const selected = account.id === props.activeAccountId;
          return (
            <div key={account.id} className="group flex items-center gap-1">
              <button
                className={[
                  "flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[8px] px-2 py-2 text-left text-sm",
                  selected ? "bg-white shadow-sm" : "hover:bg-white/70",
                ].join(" ")}
                onClick={() => props.onSelectAccount(account.id)}
              >
                <Avatar className="size-8">
                  <AvatarFallback>{account.label.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{account.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {account.source === "env" ? "from .env" : maskKey(account.apiKey)}
                  </span>
                </span>
              </button>
              {account.source === "local" ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 shrink-0 cursor-pointer opacity-0 group-hover:opacity-100"
                  onClick={() => props.onRemoveAccount(account.id)}
                  aria-label="Remove account"
                >
                  <Trash2 className="size-4" />
                </Button>
              ) : (
                <KeyRound className="mr-2 size-4 text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
