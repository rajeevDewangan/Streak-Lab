import { Flame } from "lucide-react";
import LoginForm from "./login-form";

export const metadata = { title: "Sign in — Streak Lab" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 animate-in-up">
          <div className="h-10 w-10 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elev)] flex items-center justify-center mb-4">
            <Flame className="h-4 w-4 text-[var(--color-fg)]" />
          </div>
          <h1 className="text-xl font-medium tracking-tight">Streak Lab</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Show up, Log 
          </p>
        </div>

        <div className="surface p-6 animate-in-up">
          <LoginForm next={next ?? "/dashboard"} />
        </div>

        <p className="text-xs text-center text-[var(--color-fg-dim)] mt-6">
          Signups are closed. This app is locked to 4 users.
        </p>
      </div>
    </div>
  );
}
