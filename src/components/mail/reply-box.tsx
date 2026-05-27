"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ReplyBoxProps = {
  disabled?: boolean;
  onSend: (text: string) => Promise<void>;
};

export function ReplyBox({ disabled, onSend }: ReplyBoxProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await onSend(text);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-[8px] border bg-white p-3">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a reply"
        className="min-h-28 resize-none border-0 p-0 shadow-none focus-visible:ring-0"
        disabled={disabled || sending}
      />
      <div className="mt-3 flex justify-end">
        <Button
          className="cursor-pointer"
          onClick={submit}
          disabled={disabled || sending || !text.trim()}
        >
          <Send className="size-4" />
          {sending ? "Sending" : "Send"}
        </Button>
      </div>
    </div>
  );
}
