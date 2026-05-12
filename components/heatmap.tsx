"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { toLocalDateKey, formatRelative } from "@/lib/utils";
import type { EntryWithRefs } from "@/lib/types";
import { CatIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const CELL = 11;
const GAP = 3;

function intensity(count: number) {
  if (!count) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const LEVEL_FILL = [
  "#1f1f1f", // 0 — no logs (gray)
  "#1d4ed8", // 1
  "#2563eb", // 2
  "#3b82f6", // 3
  "#93c5fd", // 4 — brightest
];

function levelFill(level: number) {
  return LEVEL_FILL[level];
}

type HeatmapProps = {
  entries: EntryWithRefs[];
  /** Number of weeks shown (most recent first). Default 53 → ~1 year. */
  weeks?: number;
  /** Optionally filter to a single category id. */
  categoryId?: string | null;
  /** Optionally filter to a single user id. */
  userId?: string | null;
};

export function Heatmap({ entries, weeks = 53, categoryId, userId }: HeatmapProps) {
  const filtered = React.useMemo(
    () =>
      entries.filter((e) => {
        if (categoryId && e.category_id !== categoryId) return false;
        if (userId && e.user_id !== userId) return false;
        return true;
      }),
    [entries, categoryId, userId],
  );

  // group by local_date
  const byDay = React.useMemo(() => {
    const map = new Map<string, EntryWithRefs[]>();
    for (const e of filtered) {
      const arr = map.get(e.local_date) ?? [];
      arr.push(e);
      map.set(e.local_date, arr);
    }
    return map;
  }, [filtered]);

  // Build a grid of [weeks] columns × 7 rows ending today.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Align so column 0 starts on a Sunday boundary.
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  const days: { key: string; date: Date }[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(endOfWeek);
      date.setDate(endOfWeek.getDate() - w * 7 - (6 - d));
      days.push({ key: toLocalDateKey(date), date });
    }
  }

  const [selected, setSelected] = React.useState<string | null>(null);

  const width = weeks * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  const monthLabels: { x: number; label: string }[] = [];
  let prevMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const firstDayOfCol = days[w * 7];
    if (!firstDayOfCol) continue;
    const m = firstDayOfCol.date.getMonth();
    if (m !== prevMonth) {
      monthLabels.push({
        x: w * (CELL + GAP),
        label: firstDayOfCol.date.toLocaleString(undefined, { month: "short" }),
      });
      prevMonth = m;
    }
  }

  const selectedEntries = selected ? byDay.get(selected) ?? [] : [];

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto overflow-y-hidden flex justify-center">
        <svg
          width={width + 20}
          height={height + 22}
          className="block shrink-0"
        >
          <g transform="translate(0, 0)">
            {monthLabels.map((m) => (
              <text
                key={`${m.x}-${m.label}`}
                x={m.x}
                y={10}
                className="fill-[var(--color-fg-dim)] text-[10px]"
              >
                {m.label}
              </text>
            ))}
          </g>
          <g transform={`translate(0, 16)`}>
            {days.map((day, i) => {
              const col = Math.floor(i / 7);
              const row = i % 7;
              const count = byDay.get(day.key)?.length ?? 0;
              const lvl = intensity(count);
              const future = day.date.getTime() > today.getTime();
              return (
                <rect
                  key={day.key + i}
                  x={col * (CELL + GAP)}
                  y={row * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  fill={levelFill(lvl)}
                  fillOpacity={future ? 0.3 : 1}
                  className={cn(
                    "transition-all duration-150",
                    !future && "cursor-pointer",
                  )}
                  style={{ strokeWidth: 1, stroke: "transparent" }}
                  onMouseEnter={(e) => {
                    if (future) return;
                    (e.currentTarget as SVGRectElement).style.stroke = "rgba(250,250,250,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as SVGRectElement).style.stroke = "transparent";
                  }}
                  onClick={() => {
                    if (future) return;
                    setSelected(day.key);
                  }}
                >
                  <title>
                    {count
                      ? `${count} log${count > 1 ? "s" : ""} on ${day.key}`
                      : `No logs on ${day.key}`}
                  </title>
                </rect>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <div className="text-[11px] text-[var(--color-fg-dim)]">
          {filtered.length} total log{filtered.length === 1 ? "" : "s"}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-fg-dim)]">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: levelFill(l) }}
            />
          ))}
          <span>more</span>
        </div>
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(v) => !v && setSelected(null)}
        title={selected ? prettyDate(selected) : ""}
        description={`${selectedEntries.length} log${selectedEntries.length === 1 ? "" : "s"}`}
      >
        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {selectedEntries.length === 0 && (
            <p className="text-sm text-[var(--color-fg-muted)] py-4 text-center">
              No proof logged this day. The streak remembers.
            </p>
          )}
          {selectedEntries.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-3 p-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)]"
            >
              <div
                className="h-7 w-7 rounded-md grid place-items-center shrink-0 border border-[var(--color-border)] bg-[var(--color-bg-elev-2)]"
                style={{ color: e.category?.color ?? "var(--color-fg)" }}
              >
                <CatIcon name={e.category?.icon ?? "sparkles"} className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-[var(--color-fg-muted)]">
                  <span className="font-medium text-[var(--color-fg)]">{e.profile?.name ?? "—"}</span>
                  <span className="text-[var(--color-border-strong)]">·</span>
                  <span>{e.category?.name ?? "—"}</span>
                  <span className="text-[var(--color-border-strong)]">·</span>
                  <span>{formatRelative(e.created_at)}</span>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap break-words">{e.content}</p>
                {e.link && (
                  <a
                    href={e.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline underline-offset-2 break-all"
                  >
                    {e.link}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}

function prettyDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
