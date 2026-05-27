"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MarkAllReadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function MarkAllReadDialog(props: MarkAllReadDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark all as read?</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-6 text-muted-foreground">
          This will mark all currently loaded inbox messages for this account as read
          in this browser.
        </p>
        <DialogFooter>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={() => props.onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="cursor-pointer" onClick={props.onConfirm}>
            Mark all as read
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
