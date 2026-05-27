"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AccountInfo, EmailDetail } from "@/lib/resend/types";
import { bytes } from "@/components/mail/format";

type ApiDetailsProps = {
  accountInfo: AccountInfo | null;
  message: EmailDetail | null;
};

export function ApiDetails({ accountInfo, message }: ApiDetailsProps) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4 text-sm">
        <section>
          <h3 className="mb-3 font-semibold">Account</h3>
          {!accountInfo ? (
            <p className="text-muted-foreground">No API account details loaded.</p>
          ) : (
            <div className="space-y-3">
              <div className="rounded-[8px] border p-3">
                <div className="text-xs text-muted-foreground">Suggested sender</div>
                <div className="mt-1 break-all font-medium">
                  {accountInfo.suggestedFrom || "Not available"}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Domains
                </div>
                <div className="space-y-2">
                  {accountInfo.domains.map((domain) => (
                    <div key={domain.id} className="rounded-[8px] border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{domain.name}</span>
                        <Badge variant={domain.status === "verified" ? "default" : "secondary"}>
                          {domain.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        sending: {domain.sending} · receiving: {domain.receiving}
                      </div>
                    </div>
                  ))}
                  {accountInfo.domains.length === 0 ? (
                    <p className="text-muted-foreground">No domains returned.</p>
                  ) : null}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  API keys
                </div>
                <div className="space-y-2">
                  {accountInfo.apiKeys.map((key) => (
                    <div key={key.id} className="rounded-[8px] border p-3">
                      <div className="font-medium">{key.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{key.id}</div>
                    </div>
                  ))}
                  {accountInfo.apiKeys.length === 0 ? (
                    <p className="text-muted-foreground">No key metadata returned.</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Message</h3>
          {!message ? (
            <p className="text-muted-foreground">Select an email to inspect message data.</p>
          ) : (
            <div className="space-y-3">
              <InfoRow label="ID" value={message.id} />
              <InfoRow label="Message-ID" value={message.messageId || "Not available"} />
              <InfoRow label="Raw MIME" value={message.rawDownloadUrl || "Not available"} />
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Attachments
                </div>
                {message.attachments.length === 0 ? (
                  <p className="text-muted-foreground">No attachments.</p>
                ) : (
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="rounded-[8px] border p-3">
                        <div className="font-medium">{attachment.filename || attachment.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {attachment.contentType} · {bytes(attachment.size)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  Headers
                </div>
                <pre className="max-h-64 overflow-auto rounded-[8px] bg-muted p-3 text-xs">
                  {JSON.stringify(message.headers, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </ScrollArea>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 break-all font-medium">{value}</div>
    </div>
  );
}
