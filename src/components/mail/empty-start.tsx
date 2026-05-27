"use client";

import { KeyRound, MailPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStartProps = {
  envAvailable: boolean;
  onUseEnv: () => void;
  onAddAccount: () => void;
};

export function EmptyStart({ envAvailable, onUseEnv, onAddAccount }: EmptyStartProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4">
      <section className="w-full max-w-3xl rounded-[8px] border bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-[8px] bg-blue-600 text-white">
            <MailPlus className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">Resend Mail Client</h1>
            <p className="text-sm text-muted-foreground">
              Read inbound mail and reply from a Resend full access API key.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[8px] border p-4">
            <KeyRound className="mb-3 size-5 text-blue-600" />
            <h2 className="mb-1 font-medium">Use a full key</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Receiving, sender domains, and replies need a Resend key with full access.
            </p>
          </div>
          <div className="rounded-[8px] border p-4">
            <ShieldCheck className="mb-3 size-5 text-emerald-600" />
            <h2 className="mb-1 font-medium">Local-first accounts</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Browser-added keys stay in local storage. Environment keys stay on the server.
            </p>
          </div>
          <div className="rounded-[8px] border p-4">
            <MailPlus className="mb-3 size-5 text-slate-700" />
            <h2 className="mb-1 font-medium">Gmail-like flow</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Switch accounts, scan inbox, open details, and reply in one screen.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {envAvailable ? (
            <Button className="cursor-pointer" onClick={onUseEnv}>
              Use .env account
            </Button>
          ) : null}
          <Button className="cursor-pointer" variant="outline" onClick={onAddAccount}>
            Add API key
          </Button>
        </div>
      </section>
    </main>
  );
}
