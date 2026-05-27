"use client";

import { Info, Loader2, Mail, MailOpen, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EmailDetail } from "@/lib/resend/types";
import type { Mailbox } from "@/components/mail/types";
import { formatDate, previewText, senderName } from "@/components/mail/format";
import { ReplyBox } from "@/components/mail/reply-box";

type MessageViewProps = {
  message: EmailDetail | null;
  mailbox: Mailbox;
  loading: boolean;
  isRead: boolean;
  isManuallySent: boolean;
  onShowInfo: () => void;
  onToggleRead: () => void;
  onSendReply: (text: string) => Promise<void>;
};

export function MessageView(props: MessageViewProps) {
  if (props.loading) {
    return (
      <section className="flex h-screen flex-1 items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </section>
    );
  }

  if (!props.message) {
    return (
      <section className="flex h-screen flex-1 items-center justify-center bg-white p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-[8px] bg-[#f1f3f4]">
            <Mail className="size-7 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Select a message</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Open an inbound email to read the thread, inspect API data, and reply.
          </p>
        </div>
      </section>
    );
  }

  const bodyText = previewText(props.message.text, props.message.html);

  return (
    <section className="flex h-screen flex-1 flex-col bg-white">
      <header className="flex min-h-16 items-center justify-between gap-4 border-b px-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold">{props.message.subject}</h1>
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm text-muted-foreground">
              {props.mailbox === "sent"
                ? `To ${props.message.to.join(", ")}`
                : `From ${senderName(props.message.from)}`}
            </p>
            {props.isManuallySent ? (
              <Badge className="shrink-0 bg-emerald-600">Manually sent</Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {props.mailbox === "inbox" ? (
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={props.onToggleRead}
            >
              {props.isRead ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
              {props.isRead ? "Mark unread" : "Mark read"}
            </Button>
          ) : null}
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={props.onShowInfo}
          >
            <Info className="size-4" />
            API info
          </Button>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <article className="mx-auto max-w-4xl space-y-6 p-6">
          <div className="rounded-[8px] border p-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="font-medium">
                  {props.mailbox === "sent" ? props.message.to.join(", ") : props.message.from}
                </div>
                <div className="break-all text-sm text-muted-foreground">
                  {props.mailbox === "sent"
                    ? `from ${props.message.from}`
                    : `to ${props.message.to.join(", ")}`}
                </div>
              </div>
              <div className="shrink-0 text-sm text-muted-foreground">
                {formatDate(props.message.createdAt)}
              </div>
            </div>

            {props.message.attachmentsCount > 0 ? (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Paperclip className="size-4" />
                {props.message.attachmentsCount} attachment
                {props.message.attachmentsCount === 1 ? "" : "s"}
              </div>
            ) : null}

            <Tabs defaultValue="text">
              <TabsList>
                <TabsTrigger className="cursor-pointer" value="text">Text</TabsTrigger>
                <TabsTrigger
                  className="cursor-pointer"
                  value="html"
                  disabled={!props.message.html}
                >
                  HTML
                </TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <pre className="mt-4 whitespace-pre-wrap rounded-[8px] bg-white text-sm leading-7">
                  {bodyText}
                </pre>
              </TabsContent>
              <TabsContent value="html">
                <iframe
                  title="Email HTML body"
                  sandbox=""
                  srcDoc={props.message.html || ""}
                  className="mt-4 h-[520px] w-full rounded-[8px] border bg-white"
                />
              </TabsContent>
            </Tabs>
          </div>

          {props.mailbox === "inbox" ? (
            <ReplyBox onSend={props.onSendReply} />
          ) : (
            <div className="rounded-[8px] border bg-muted/40 p-4 text-sm text-muted-foreground">
              Replies are available for inbound messages.
            </div>
          )}
        </article>
      </ScrollArea>
    </section>
  );
}
