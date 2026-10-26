"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthLock } from "@/components/mail/auth-lock";
import { MailClient } from "@/components/mail/mail-client";

type AuthState = {
  loading: boolean;
  required: boolean;
  authenticated: boolean;
};

export function AuthGate() {
  const [auth, setAuth] = useState<AuthState>({
    loading: true,
    required: false,
    authenticated: true,
  });

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data: { required?: boolean; authenticated?: boolean }) => {
        setAuth({
          loading: false,
          required: Boolean(data.required),
          authenticated: Boolean(data.authenticated),
        });
      })
      .catch(() => {
        setAuth({ loading: false, required: false, authenticated: true });
      });
  }, []);

  if (auth.loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f8fc]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (auth.required && !auth.authenticated) {
    return (
      <AuthLock
        onUnlock={() => {
          setAuth({ loading: false, required: true, authenticated: true });
        }}
      />
    );
  }

  return (
    <MailClient
      isPasswordProtected={auth.required}
      onLock={() => {
        fetch("/api/auth/logout", { method: "POST" }).finally(() => {
          setAuth({ loading: false, required: true, authenticated: false });
        });
      }}
    />
  );
}
