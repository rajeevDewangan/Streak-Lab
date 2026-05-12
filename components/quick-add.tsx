"use client";

import * as React from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CatIcon } from "@/components/ui/icon";
import { useQuickAdd } from "@/components/quick-add-context";
import { createEntry } from "@/lib/actions/entries";
import { todayKey } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function QuickAdd({ categories }: { categories: Category[] }) {
  const { isOpen, close, presetCategoryId } = useQuickAdd();
  const [categoryId, setCategoryId] = React.useState<string | null>(null);
  const [content, setContent] = React.useState("");
  const [link, setLink] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const textRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCategoryId(presetCategoryId ?? categories[0]?.id ?? null);
      setContent("");
      setLink("");
      setTimeout(() => textRef.current?.focus(), 50);
    }
  }, [isOpen, presetCategoryId, categories]);

  async function submit() {
    if (!categoryId) {
      toast.error("Pick a category first.");
      return;
    }
    if (!content.trim()) {
      toast.error("Write what you did.");
      textRef.current?.focus();
      return;
    }
    setPending(true);
    const res = await createEntry({
      categoryId,
      content,
      link: link || null,
      localDate: todayKey(),
    });
    setPending(false);
    if ("error" in res && res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Logged.");
    close();
  }

  function onKey(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => (v ? null : close())}
      title="Log a proof"
      description="Anything counts — a problem solved, a paragraph read, a concept understood."
    >
      <div className="flex flex-col gap-5" onKeyDown={onKey}>
        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.length === 0 && (
              <p className="text-xs text-[var(--color-fg-dim)]">
                Create a category first from the dashboard.
              </p>
            )}
            {categories.map((c) => {
              const active = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md border text-xs transition-colors",
                    active
                      ? "border-[var(--color-fg)] bg-[var(--color-bg-elev-2)] text-[var(--color-fg)]"
                      : "border-[var(--color-border)] bg-transparent text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:border-[var(--color-border-strong)]",
                  )}
                >
                  <CatIcon name={c.icon} className="h-3 w-3" />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            What did you do?
          </label>
          <Textarea
            ref={textRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Solved 2 sliding window problems; understood why HashMap variant beats nested loop here."
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Link (optional)
          </label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://leetcode.com/..."
            type="url"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <span className="text-[11px] text-[var(--color-fg-dim)] mr-auto font-mono">
            Ctrl+Enter to submit
          </span>
          <Button variant="ghost" onClick={close} type="button">
            Cancel
          </Button>
          <Button onClick={submit} loading={pending}>
            Log it
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
