"use client";

import { RefreshCw, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MailSettings } from "@/components/mail/types";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: MailSettings;
  onSettingsChange: (settings: MailSettings) => void;
};

export function SettingsDialog(props: SettingsDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Default Sender Configuration */}
          <div className="space-y-3 rounded-[8px] border p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserCheck className="size-4 text-blue-600" />
              <span>Default Sender Identity</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure your default sender name and email for outgoing replies.
            </p>

            <div className="space-y-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Sender name</span>
                <Input
                  placeholder="e.g. Antar or Support Team"
                  value={props.settings.defaultSenderName || ""}
                  onChange={(e) =>
                    props.onSettingsChange({
                      ...props.settings,
                      defaultSenderName: e.target.value,
                    })
                  }
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700">Sender email</span>
                <Input
                  placeholder="e.g. antar@100xsale.com"
                  value={props.settings.defaultSenderEmail || ""}
                  onChange={(e) =>
                    props.onSettingsChange({
                      ...props.settings,
                      defaultSenderEmail: e.target.value,
                    })
                  }
                />
              </label>
            </div>
          </div>

          {/* Auto check */}
          <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border p-3">
            <input
              type="checkbox"
              className="mt-1 size-4 cursor-pointer accent-blue-600"
              checked={props.settings.autoCheckEnabled}
              onChange={(event) =>
                props.onSettingsChange({
                  ...props.settings,
                  autoCheckEnabled: event.target.checked,
                })
              }
            />
            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium">
                <RefreshCw className="size-4 text-muted-foreground" />
                Check mail every minute
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Runs quietly in the background for the active folder.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button className="cursor-pointer" onClick={() => props.onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
