"use client";

import { useMemo, useState } from "react";
import { Paperclip, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { EmailSummary } from "@/lib/resend/types";
import type { Mailbox } from "@/components/mail/types";
import { formatDate, senderName } from "@/components/mail/format";

type MessageListProps = {
  messages: EmailSummary[];
  selectedId?: string;
  mailbox: Mailbox;
  loading: boolean;
  readIds?: Set<string>;
  manualSentIds?: Set<string>;
  onMarkAllRead?: () => void;
  onSelect: (id: string) => void;
};

export function MessageList(props: MessageListProps) {
  const [query, setQuery] = useState("");
  const readIds = props.readIds ?? new Set<string>();
  const manualSentIds = props.manualSentIds ?? new Set<string>();
  const unreadCount = props.messages.filter((message) => !readIds.has(message.id)).length;
  const visibleMessages = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return props.messages;
    return props.messages.filter((message) => (
      message.subject.toLowerCase().includes(normalized) ||
      message.from.toLowerCase().includes(normalized) ||
      message.to.join(" ").toLowerCase().includes(normalized)
    ));
  }, [props.messages, query]);

  return (
    <section className="h-screen w-[390px] shrink-0 border-r bg-white">
      <header className="space-y-3 border-b px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {props.mailbox === "inbox" ? "Inbox" : "Sent"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {props.loading ? "Refreshing..." : `${props.messages.length} messages`}
            </p>
            {props.mailbox === "inbox" ? (
              <p className="text-xs text-blue-700">
                {unreadCount} new
              </p>
            ) : null}
            {props.mailbox === "sent" ? (
              <p className="text-xs text-emerald-700">
                {props.messages.filter((message) => manualSentIds.has(message.id)).length} manually sent
              </p>
            ) : null}
          </div>
          {props.mailbox === "inbox" ? (
            <Button
              className="cursor-pointer"
              size="sm"
              variant="outline"
              disabled={unreadCount === 0 || props.loading}
              onClick={props.onMarkAllRead}
            >
              Mark all read
            </Button>
          ) : null}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search mail"
            className="h-9 rounded-[8px] bg-[#f1f3f4] pl-9"
          />
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-7.125rem)]">
        {props.loading ? <LoadingList /> : null}
        {!props.loading && visibleMessages.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No messages available for this account.
          </div>
        ) : null}
        {!props.loading && visibleMessages.map((message) => {
          const unread = props.mailbox === "inbox" && !readIds.has(message.id);
          const manuallySent = props.mailbox === "sent" && manualSentIds.has(message.id);
          return (
            <button
              key={message.id}
              className={[
                "block w-full cursor-pointer border-b px-4 py-3 text-left hover:bg-[#f6f8fc]",
                manuallySent ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-transparent",
                message.id === props.selectedId ? "bg-[#eef4ff]" : unread ? "bg-white" : "bg-[#fafafa]",
              ].join(" ")}
              onClick={() => props.onSelect(message.id)}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className={[
                  "truncate text-sm",
                  unread ? "font-semibold text-slate-950" : "font-medium text-slate-700",
                ].join(" ")}
                >
                  {props.mailbox === "sent"
                    ? `To: ${message.to.join(", ")}`
                    : senderName(message.from)}
                </span>
                <span className={[
                  "shrink-0 text-xs",
                  unread ? "font-medium text-blue-700" : "text-muted-foreground",
                ].join(" ")}
                >
                  {formatDate(message.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {unread ? <span className="size-2 shrink-0 rounded-full bg-blue-600" /> : null}
                <p className={[
                  "min-w-0 flex-1 truncate text-sm",
                  unread ? "font-semibold text-slate-950" : "text-muted-foreground",
                ].join(" ")}
                >
                  {message.subject}
                </p>
                {unread ? <Badge variant="secondary">New</Badge> : null}
                {manuallySent ? <Badge className="bg-emerald-600">Manually sent</Badge> : null}
                {message.attachmentsCount > 0 ? (
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                ) : null}
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {message.id}
              </p>
            </button>
          );
        })}
      </ScrollArea>
    </section>
  );
}

function LoadingList() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-2 rounded-[8px] border p-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
