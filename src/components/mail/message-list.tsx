"use client";

import { useMemo, useState } from "react";
import { Paperclip, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmailSummary } from "@/lib/resend/types";
import type { Mailbox } from "@/components/mail/types";
import { formatDate, senderName } from "@/components/mail/format";

type MessageListProps = {
  messages: EmailSummary[];
  selectedId?: string;
  mailbox: Mailbox;
  loading: boolean;
  onSelect: (id: string) => void;
};

export function MessageList(props: MessageListProps) {
  const [query, setQuery] = useState("");
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
        <div>
          <h2 className="text-lg font-semibold">
            {props.mailbox === "inbox" ? "Inbox" : "Sent"}
          </h2>
          <p className="text-xs text-muted-foreground">{props.messages.length} messages</p>
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
        {!props.loading && visibleMessages.map((message) => (
          <button
            key={message.id}
            className={[
              "block w-full cursor-pointer border-b px-4 py-3 text-left hover:bg-[#f6f8fc]",
              message.id === props.selectedId ? "bg-[#eef4ff]" : "bg-white",
            ].join(" ")}
            onClick={() => props.onSelect(message.id)}
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium">
                {props.mailbox === "sent"
                  ? `To: ${message.to.join(", ")}`
                  : senderName(message.from)}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(message.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm text-foreground">
                {message.subject}
              </p>
              {message.attachmentsCount > 0 ? (
                <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
              ) : null}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {message.id}
            </p>
          </button>
        ))}
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
