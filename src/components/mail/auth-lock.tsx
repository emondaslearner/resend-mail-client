"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthLockProps = {
  onUnlock: () => void;
};

export function AuthLock({ onUnlock }: AuthLockProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Incorrect password. Please try again.");
        return;
      }

      onUnlock();
    } catch {
      setError("Unable to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] p-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Lock className="size-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Protected Inbox
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter the team access password to unlock the mailbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password…"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs font-medium text-destructive">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full cursor-pointer gap-2"
            disabled={loading || !password.trim()}
          >
            <ShieldCheck className="size-4" />
            {loading ? "Verifying…" : "Unlock Inbox"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Password protection is managed via <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">INBOX_PASSWORD</code> in your environment.
        </p>
      </div>
    </div>
  );
}
