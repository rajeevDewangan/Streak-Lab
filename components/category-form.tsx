"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CatIcon, ICON_OPTIONS } from "@/components/ui/icon";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLORS = [
  "#fafafa", "#a3a3a3", "#737373",
  "#4ade80", "#22d3ee", "#60a5fa",
  "#a78bfa", "#f472b6", "#fbbf24", "#f87171",
];

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category;
}) {
  const isEdit = !!category;
  const [name, setName] = React.useState(category?.name ?? "");
  const [icon, setIcon] = React.useState(category?.icon ?? "sparkles");
  const [color, setColor] = React.useState(category?.color ?? COLORS[0]);
  const [goal, setGoal] = React.useState<string>(category?.goal?.toString() ?? "");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setIcon(category?.icon ?? "sparkles");
      setColor(category?.color ?? COLORS[0]);
      setGoal(category?.goal?.toString() ?? "");
    }
  }, [open, category]);

  async function submit() {
    if (!name.trim()) return toast.error("Name required");
    setPending(true);
    const goalNum = goal ? Math.max(0, parseInt(goal, 10) || 0) : null;
    const res = isEdit
      ? await updateCategory(category!.id, { name, icon, color, goal: goalNum })
      : await createCategory({ name, icon, color, goal: goalNum });
    setPending(false);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success(isEdit ? "Updated" : "Category created");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit category" : "New category"}
    >
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Name
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DSA" />
        </div>

        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Icon
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map((i) => {
              const active = i === icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    "h-8 w-8 rounded-md border grid place-items-center transition-colors",
                    active
                      ? "border-[var(--color-fg)] bg-[var(--color-bg-elev-2)] text-[var(--color-fg)]"
                      : "border-[var(--color-border)] bg-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]",
                  )}
                  title={i}
                >
                  <CatIcon name={i} className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Accent
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => {
              const active = c === color;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-md transition-all border",
                    active
                      ? "border-[var(--color-fg)] scale-105"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]",
                  )}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Goal (total logs) — optional
          </label>
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            type="number"
            min="0"
            placeholder="e.g. 30"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={submit} loading={pending}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
