"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        <label className="flex cursor-pointer items-start gap-3 rounded-[8px] border p-3">
          <input
            type="checkbox"
            className="mt-1 size-4 cursor-pointer accent-blue-600"
            checked={props.settings.autoCheckEnabled}
            onChange={(event) => props.onSettingsChange({
              ...props.settings,
              autoCheckEnabled: event.target.checked,
            })}
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
        <DialogFooter>
          <Button className="cursor-pointer" onClick={() => props.onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
