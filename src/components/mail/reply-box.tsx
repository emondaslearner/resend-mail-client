"use client";

import { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImageIcon,
  Paperclip,
  Video,
  FileText,
  Send,
  X,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { bytes, fileToAttachment } from "@/components/mail/format";
import type { AttachmentPayload, ReplyPayload } from "@/components/mail/types";

type ReplyBoxProps = {
  disabled?: boolean;
  onSend: (payload: ReplyPayload) => Promise<void>;
};

function ToolbarBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex size-7 items-center justify-center rounded transition-colors",
        "hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
        active ? "bg-muted font-bold text-foreground" : "text-muted-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function getFileIcon(type: string) {
  if (type.startsWith("video/")) return <Video className="size-3.5 text-blue-500" />;
  if (type.startsWith("image/")) return <ImageIcon className="size-3.5 text-emerald-500" />;
  return <FileText className="size-3.5 text-amber-500" />;
}

export function ReplyBox({ disabled, onSend }: ReplyBoxProps) {
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
      const attachments: AttachmentPayload[] = await Promise.all(
        attachedFiles.map((file) => fileToAttachment(file)),
      );
      await onSend({ html, text, attachments });
      editor.commands.clearContent();
      setAttachedFiles([]);
    } finally {
      setSending(false);
    }
  }

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const incoming = Array.from(files);
    setAttachedFiles((prev) => [...prev, ...incoming]);
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

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
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
      {/* Formatting toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/20 px-2 py-1.5">
        <ToolbarBtn
          title="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="size-3.5" />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarBtn
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-3.5" />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-3.5" />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-3.5" />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarBtn
          title="Align left"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Align center"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Align right"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-3.5" />
        </ToolbarBtn>

        <div className="mx-1 h-4 w-px bg-border" />

        <ToolbarBtn title="Insert link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 className="size-3.5" />
        </ToolbarBtn>
      </div>

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
                  onClick={() => removeFile(i)}
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
          <ToolbarBtn
            title="Attach files (documents, archives, etc.)"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Attach video (MP4, WebM, MOV, etc.)"
            onClick={() => videoInputRef.current?.click()}
          >
            <Video className="size-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Insert image inline"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="size-4" />
          </ToolbarBtn>
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
