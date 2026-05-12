"use client";

import { Flame, Trophy, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StreakInfo } from "@/lib/types";

export type MemberStreak = {
  id: string;
  name: string;
  streak: StreakInfo;
};

export function StreakCards({
  me,
  meName,
  others,
}: {
  me: StreakInfo;
  meName: string;
  others: MemberStreak[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard
        icon={Flame}
        label="Current streak"
        value={me.current}
        suffix="days"
        emphasized={me.current > 0 && me.loggedToday}
      />
      <StatCard
        icon={Trophy}
        label="Longest streak"
        value={me.longest}
        suffix="days"
      />
      <StatCard
        icon={Calendar}
        label="Today"
        value={me.loggedToday ? "✓" : "—"}
        sub={me.loggedToday ? "Streak protected" : "Log something to keep the streak"}
      />
      <StatCard
        icon={Clock}
        label="30-day consistency"
        value={`${me.consistencyPct}%`}
      />

      {others.length > 0 && (
        <div className="col-span-2 md:col-span-4 surface p-4 mt-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs uppercase tracking-wide text-[var(--color-fg-muted)]">
              Friends · {others.length}
            </div>
            <div className="text-[11px] text-[var(--color-fg-dim)]">
              Everyone showing up keeps everyone honest.
            </div>
          </div>
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {others.map((o) => (
              <li
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-2 min-w-0 sm:w-40">
                  <div className="h-6 w-6 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] grid place-items-center text-[10px] font-semibold text-[var(--color-fg-muted)] shrink-0">
                    {o.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate">{o.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span>
                    <span className="font-medium tabular-nums">{o.streak.current}</span>
                    <span className="text-[var(--color-fg-muted)] ml-1">day streak</span>
                  </span>
                  <span className="text-[var(--color-border-strong)]">·</span>
                  <span>
                    {o.streak.loggedToday ? (
                      <span className="text-[var(--color-success)]">logged today</span>
                    ) : (
                      <span className="text-[var(--color-warn)]">no log today</span>
                    )}
                  </span>
                </div>
                <div className="sm:ml-auto text-[11px] text-[var(--color-fg-dim)] tabular-nums">
                  longest {o.streak.longest}d · {o.streak.consistencyPct}% (30d)
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  sub,
  emphasized,
}: {
  icon: typeof Flame;
  label: string;
  value: number | string;
  suffix?: string;
  sub?: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "surface p-4 transition-colors",
        emphasized && "border-[var(--color-border-strong)]",
      )}
    >
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[var(--color-fg-muted)] mb-3">
        <Icon className="h-3 w-3 text-[var(--color-fg-dim)]" />
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {suffix && (
          <div className="text-xs text-[var(--color-fg-muted)]">{suffix}</div>
        )}
      </div>
      {sub && <p className="text-[11px] text-[var(--color-fg-dim)] mt-1">{sub}</p>}
    </div>
  );
}
