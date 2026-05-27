"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NoticeBannerProps = {
  error: string | null;
  notice: string | null;
  onClose: () => void;
};

export function NoticeBanner(props: NoticeBannerProps) {
  if (!props.error && !props.notice) return null;

  return (
    <div className="absolute left-4 right-4 top-3 z-10 flex items-center justify-between rounded-[8px] border bg-white px-4 py-2 text-sm shadow-sm">
      <span className={props.error ? "text-destructive" : "text-emerald-700"}>
        {props.error || props.notice}
      </span>
      <Button
        size="icon"
        variant="ghost"
        className="size-7 cursor-pointer"
        onClick={props.onClose}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
