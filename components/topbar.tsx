"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Calendar,
  LayoutDashboard,
  Activity,
  BarChart3,
  BookOpen,
  LogOut,
  Plus,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { useQuickAdd } from "@/components/quick-add-context";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/heatmap", label: "Heatmap", icon: Calendar },
  { href: "/feed", label: "Feed", icon: Activity },
  { href: "/weekly", label: "Weekly", icon: BarChart3 },
  { href: "/notes", label: "Notes", icon: BookOpen },
] as const;

export function Topbar({ me }: { me: Profile | null; others?: Profile[] }) {
  const path = usePathname();
  const { open } = useQuickAdd();

  return (
    <header className="sticky top-0 z-30 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2 mr-2">
          <div className="h-7 w-7 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elev)] grid place-items-center">
            <Flame className="h-3.5 w-3.5 text-[var(--color-fg)]" />
          </div>
          <span className="hidden sm:inline font-medium text-sm tracking-tight text-[var(--color-fg)]">
            Streak Lab
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = path === item.href || path.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[13px] transition-colors whitespace-nowrap",
                  active
                    ? "text-[var(--color-fg)] bg-[var(--color-bg-elev-2)]"
                    : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elev)]",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button onClick={() => open()} size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log proof</span>
            <span className="hidden lg:inline kbd ml-1">Ctrl+K</span>
          </Button>

          <div
            className="flex items-center gap-2 px-2 h-8 rounded-md border border-[var(--color-border)]"
            title={me?.name}
          >
            <div className="h-5 w-5 rounded-full bg-[var(--color-fg)] grid place-items-center text-[10px] font-semibold text-[var(--color-bg)]">
              {me?.name.slice(0, 1).toUpperCase() ?? "?"}
            </div>
            <span className="hidden sm:inline text-xs text-[var(--color-fg)]">{me?.name ?? "—"}</span>
          </div>

          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="icon" title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
