"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MailAccount } from "@/components/mail/types";

type AddAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: MailAccount) => void;
};

export function AddAccountDialog({ open, onOpenChange, onAdd }: AddAccountDialogProps) {
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fromAddress, setFromAddress] = useState("");

  function submit() {
    const nextLabel = label.trim() || "Resend account";
    const key = apiKey.trim();
    if (!key) return;

    onAdd({
      id: crypto.randomUUID(),
      label: nextLabel,
      source: "local",
      apiKey: key,
      fromAddress: fromAddress.trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    setLabel("");
    setApiKey("");
    setFromAddress("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Resend account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Account name</span>
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Work support"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Full access API key</span>
            <Input
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="re_..."
              type="password"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium">Sender address</span>
            <Input
              value={fromAddress}
              onChange={(event) => setFromAddress(event.target.value)}
              placeholder="Name <support@example.com>"
            />
          </label>

          <p className="text-sm leading-6 text-muted-foreground">
            Local accounts are stored in this browser only. Use a verified Resend sender
            address for replies.
          </p>
        </div>

        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={submit} disabled={!apiKey.trim()}>
            <Plus className="size-4" />
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
