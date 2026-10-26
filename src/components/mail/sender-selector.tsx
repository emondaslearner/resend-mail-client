"use client";

import { CheckCircle2, User } from "lucide-react";
import type { DomainInfo } from "@/lib/resend/types";

type SenderSelectorProps = {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  domains?: DomainInfo[];
};

export function SenderSelector({
  name,
  email,
  onNameChange,
  onEmailChange,
  domains = [],
}: SenderSelectorProps) {
  const verifiedDomains = domains.filter(
    (d) => d.status === "verified" && d.sending === "enabled",
  );

  function handleDomainPick(domainName: string) {
    if (!domainName) return;
    const prefix = email ? email.split("@")[0].trim() : "support";
    onEmailChange(`${prefix || "support"}@${domainName}`);
  }

  const selectedDomain = verifiedDomains.find((d) => email.toLowerCase().endsWith(`@${d.name.toLowerCase()}`));

  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/15 px-3 py-1.5 text-xs text-slate-700">
      <div className="flex items-center gap-1 font-semibold text-muted-foreground">
        <User className="size-3.5" />
        <span>From:</span>
      </div>

      {/* Sender Name */}
      <input
        type="text"
        placeholder="Sender Name (e.g. Antar)"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-7 w-32 rounded border bg-white px-2 text-xs font-medium text-slate-900 placeholder:text-muted-foreground/70 focus:border-blue-500 focus:outline-none"
      />

      {/* Sender Email Address */}
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">&lt;</span>
        <input
          type="email"
          placeholder="email@100xsale.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-7 min-w-[180px] rounded border bg-white px-2 text-xs font-medium text-slate-900 placeholder:text-muted-foreground/70 focus:border-blue-500 focus:outline-none"
        />
        <span className="text-muted-foreground">&gt;</span>
      </div>

      {/* Domain Quick Selector */}
      {verifiedDomains.length > 0 && (
        <div className="flex items-center gap-1">
          <select
            value={selectedDomain?.name || ""}
            onChange={(e) => handleDomainPick(e.target.value)}
            className="h-7 cursor-pointer rounded border bg-white px-2 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="" disabled>Verified domain…</option>
            {verifiedDomains.map((d) => (
              <option key={d.id} value={d.name}>
                @{d.name}
              </option>
            ))}
          </select>
          {selectedDomain && (
            <span
              title="Domain is verified in Resend"
              className="flex items-center gap-1 text-[11px] font-medium text-emerald-600"
            >
              <CheckCircle2 className="size-3" />
              Verified
            </span>
          )}
        </div>
      )}
    </div>
  );
}

