"use client";

import { useActionState } from "react";
import { signInAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">Email</span>
        <Input name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">Password</span>
        <Input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state?.error && (
        <p className="text-xs text-[var(--color-danger)] bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending} className="mt-2 w-full">
        Sign in
      </Button>
    </form>
  );
}
