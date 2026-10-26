"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { FileText, ImageIcon, Paperclip, Send, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bytes, fileToAttachment } from "@/components/mail/format";
import type { AttachmentPayload, ReplyPayload } from "@/components/mail/types";
import type { DomainInfo } from "@/lib/resend/types";
import { SenderSelector } from "@/components/mail/sender-selector";
import { ReplyToolbar } from "@/components/mail/reply-toolbar";

type ReplyBoxProps = {
  disabled?: boolean;
  onSend: (payload: ReplyPayload) => Promise<void>;
  domains?: DomainInfo[];
  defaultSender?: { name?: string; email?: string };
};

function getFileIcon(type: string) {
  if (type.startsWith("video/")) return <Video className="size-3.5 text-blue-500" />;
  if (type.startsWith("image/")) return <ImageIcon className="size-3.5 text-emerald-500" />;
  return <FileText className="size-3.5 text-amber-500" />;
}

export function ReplyBox({ disabled, onSend, domains, defaultSender }: ReplyBoxProps) {
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [senderName, setSenderName] = useState(defaultSender?.name || "Antar");
  const [senderEmail, setSenderEmail] = useState(defaultSender?.email || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("resend-mail-client.last-sender.v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSenderName(parsed.name?.trim() || defaultSender?.name || "Antar");
        if (parsed.email) setSenderEmail(parsed.email);
        return;
      }
    } catch {}

    setSenderName(defaultSender?.name || "Antar");
    if (defaultSender?.email) setSenderEmail(defaultSender.email);
    else if (domains && domains.length > 0) {
      const verified = domains.find((d) => d.status === "verified" && d.sending === "enabled");
      if (verified) setSenderEmail(`antar@${verified.name}`);
    }
  }, [defaultSender, domains]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Write a reply…" }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[140px] max-h-[320px] overflow-y-auto p-3.5 focus:outline-none text-sm leading-6 prose prose-sm max-w-none",
      },
    },
  });

  const isEmpty = (!editor || editor.isEmpty) && attachedFiles.length === 0;

  async function submit() {
    if (!editor || isEmpty || sending) return;
    setSending(true);
    try {
      const html = editor.getHTML();
      const text = editor.getText();
      const effectiveName = senderName.trim() || "Antar";
      const from = senderEmail.trim()
        ? `${effectiveName} <${senderEmail.trim()}>`
        : undefined;

      if (senderEmail.trim()) {
        try {
          window.localStorage.setItem(
            "resend-mail-client.last-sender.v1",
            JSON.stringify({ name: effectiveName, email: senderEmail }),
          );
        } catch {}
      }

      const attachments: AttachmentPayload[] = await Promise.all(
        attachedFiles.map((file) => fileToAttachment(file)),
      );
      await onSend({ html, text, from, attachments });
      editor.commands.clearContent();
      setAttachedFiles([]);
    } finally {
      setSending(false);
    }
  }

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
  }

  function addImageInline(files: FileList | null) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          editor?.chain().focus().setImage({ src: reader.result, alt: file.name }).run();
        }
      };
      reader.readAsDataURL(file);
    });
  }

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const totalBytes = attachedFiles.reduce((acc, f) => acc + f.size, 0);

  if (!editor) return null;

  return (
    <div className="rounded-[8px] border bg-white shadow-xs">
      {/* Sender (From) Selector */}
      <SenderSelector
        name={senderName}
        email={senderEmail}
        onNameChange={setSenderName}
        onEmailChange={setSenderEmail}
        domains={domains}
      />

      {/* Formatting toolbar */}
      <ReplyToolbar editor={editor} onSetLink={setLink} />

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Attached Files List */}
      {attachedFiles.length > 0 && (
        <div className="border-t bg-muted/10 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {attachedFiles.length} {attachedFiles.length === 1 ? "attachment" : "attachments"} (
              {bytes(totalBytes)})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border bg-white px-2.5 py-1.5 text-xs shadow-2xs"
              >
                {getFileIcon(file.type)}
                <span className="max-w-[200px] truncate font-medium">{file.name}</span>
                <span className="text-muted-foreground">({bytes(file.size)})</span>
                <button
                  type="button"
                  title="Remove"
                  onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action / Attachment Bar */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Attach files (documents, archives, etc.)"
            onClick={() => fileInputRef.current?.click()}
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            <Paperclip className="size-4" />
          </button>
          <button
            type="button"
            title="Attach video (MP4, WebM, MOV, etc.)"
            onClick={() => videoInputRef.current?.click()}
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            <Video className="size-4" />
          </button>
          <button
            type="button"
            title="Insert image inline"
            onClick={() => imageInputRef.current?.click()}
            className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            <ImageIcon className="size-4" />
          </button>
        </div>

        <Button
          className="cursor-pointer gap-2"
          onClick={submit}
          disabled={disabled || sending || isEmpty}
        >
          <Send className="size-4" />
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>

      {/* Hidden file pickers */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addImageInline(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
