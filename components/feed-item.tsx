"use client";

import { CatIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import type { EntryWithRefs } from "@/lib/types";

export function FeedItem({ entry, fresh = false }: { entry: EntryWithRefs; fresh?: boolean }) {
  const color = entry.category?.color ?? "#7c5cff";
  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg surface ${fresh ? "animate-in-up" : ""}`}
    >
      <div
        className="h-9 w-9 rounded-md grid place-items-center shrink-0 border border-[var(--color-border)] bg-[var(--color-bg-elev-2)]"
        style={{ color }}
      >
        <CatIcon name={entry.category?.icon ?? "sparkles"} className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[var(--color-fg)]">
            {entry.profile?.name ?? "—"}
          </span>
          <Badge color={color}>{entry.category?.name ?? "—"}</Badge>
          <span className="text-[var(--color-fg-dim)] ml-auto whitespace-nowrap">
            {formatRelative(entry.created_at)}
          </span>
        </div>
        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{entry.content}</p>
        {entry.link && (
          <a
            href={entry.link}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline underline-offset-2 break-all inline-block mt-1"
          >
            {entry.link}
          </a>
        )}
      </div>
    </div>
  );
}
