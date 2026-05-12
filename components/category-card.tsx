"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatIcon } from "@/components/ui/icon";
import { useQuickAdd } from "@/components/quick-add-context";
import { formatRelative } from "@/lib/utils";
import { computeStreak } from "@/lib/streak";
import type { Category, EntryWithRefs } from "@/lib/types";
import { CategoryFormDialog } from "@/components/category-form";
import { deleteCategory } from "@/lib/actions/categories";
import { toast } from "sonner";

export function CategoryCard({
  category,
  entries,
}: {
  category: Category;
  entries: EntryWithRefs[];
}) {
  const { open } = useQuickAdd();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const catEntries = React.useMemo(
    () => entries.filter((e) => e.category_id === category.id),
    [entries, category.id],
  );
  const streak = React.useMemo(
    () => computeStreak(catEntries.map((e) => e.local_date)),
    [catEntries],
  );
  const lastUpdate = catEntries[0]?.created_at;

  const goalPct = category.goal
    ? Math.min(100, Math.round((catEntries.length / category.goal) * 100))
    : null;

  async function onDelete() {
    if (!confirm(`Delete "${category.name}" and all its logs?`)) return;
    const res = await deleteCategory(category.id);
    if ("error" in res && res.error) toast.error(res.error);
    else toast.success("Category deleted");
    setMenuOpen(false);
  }

  return (
    <div className="surface relative p-4 group transition-colors hover:border-[var(--color-border-strong)]">
      <div className="flex items-start justify-between">
        <Link href={`/category/${category.id}`} className="flex items-center gap-2.5 min-w-0">
          <div
            className="h-8 w-8 rounded-md grid place-items-center shrink-0 border border-[var(--color-border)] bg-[var(--color-bg-elev-2)]"
            style={{ color: category.color }}
          >
            <CatIcon name={category.icon} className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium truncate">{category.name}</h3>
            <p className="text-[11px] text-[var(--color-fg-dim)]">
              {catEntries.length} log{catEntries.length === 1 ? "" : "s"}
              {lastUpdate ? ` · ${formatRelative(lastUpdate)}` : " · no logs yet"}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMenuOpen(false), 120)}
            className="p-1 rounded text-[var(--color-fg-dim)] hover:text-[var(--color-fg)] hover:bg-[var(--color-bg-elev-2)] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-md py-1 min-w-[140px] text-sm animate-in-up">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  setEditOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[var(--color-bg-elev-2)]"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-[var(--color-danger)] hover:bg-[var(--color-bg-elev-2)]"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-4 mt-4">
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--color-fg-dim)]">
            Streak
          </div>
          <div className="text-xl font-semibold tracking-tight mt-0.5">
            {streak.current}
            <span className="text-xs text-[var(--color-fg-muted)] ml-0.5 font-normal">d</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--color-fg-dim)]">
            Best
          </div>
          <div className="text-xl font-semibold tracking-tight mt-0.5 text-[var(--color-fg-muted)]">
            {streak.longest}
            <span className="text-xs ml-0.5 font-normal">d</span>
          </div>
        </div>
        {goalPct !== null && (
          <div className="ml-auto text-right">
            <div className="text-[10px] uppercase tracking-wide text-[var(--color-fg-dim)]">
              Goal
            </div>
            <div className="text-xs font-medium mt-0.5">
              {catEntries.length}/{category.goal}
            </div>
          </div>
        )}
      </div>

      {goalPct !== null && (
        <div className="mt-2 h-[3px] rounded-full bg-[var(--color-bg-elev-2)] overflow-hidden">
          <div
            className="h-full transition-all duration-500 bg-[var(--color-fg)]"
            style={{ width: `${goalPct}%` }}
          />
        </div>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => open(category.id)}
        className="w-full mt-4 justify-center"
      >
        <Plus className="h-3 w-3" /> Log
      </Button>

      <CategoryFormDialog open={editOpen} onOpenChange={setEditOpen} category={category} />
    </div>
  );
}
