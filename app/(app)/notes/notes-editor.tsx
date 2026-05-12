"use client";

import * as React from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Check, CircleDot, Eye, Pencil } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSharedDoc } from "@/lib/actions/notes";
import { cn, formatRelative } from "@/lib/utils";

type Tab = "write" | "preview";

export function NotesEditor({
  initialContent,
  updatedAt,
  updatedByName,
}: {
  initialContent: string;
  updatedAt: string | null;
  updatedByName: string | null;
}) {
  const [content, setContent] = React.useState(initialContent);
  const [baseline, setBaseline] = React.useState(initialContent);
  const [tab, setTab] = React.useState<Tab>("write");
  const [saving, startSaving] = React.useTransition();

  React.useEffect(() => {
    if (baseline === content) {
      setContent(initialContent);
      setBaseline(initialContent);
    }
  }, [initialContent]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = content !== baseline;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const save = React.useCallback(() => {
    if (!dirty) return;
    startSaving(async () => {
      const res = await saveSharedDoc(content);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setBaseline(content);
      toast.success("Saved");
    });
  }, [content, dirty]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  return (
    <section className="surface flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex bg-[var(--color-bg-elev-2)] rounded-md p-0.5 border border-[var(--color-border)]">
            <TabButton active={tab === "write"} onClick={() => setTab("write")}>
              <Pencil className="h-3 w-3" />
              Write
            </TabButton>
            <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
              <Eye className="h-3 w-3" />
              Preview
            </TabButton>
          </div>
          <span className="text-[11px] text-[var(--color-fg-dim)] hidden sm:inline tabular-nums">
            {wordCount} word{wordCount === 1 ? "" : "s"} · {content.length} chars
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] px-2 h-6 rounded-full whitespace-nowrap",
              dirty
                ? "bg-[var(--color-warn)]/12 text-[var(--color-warn)]"
                : "bg-[var(--color-success)]/12 text-[var(--color-success)]",
            )}
          >
            {dirty ? (
              <CircleDot className="h-2.5 w-2.5" />
            ) : (
              <Check className="h-2.5 w-2.5" />
            )}
            {dirty ? "Unsaved" : "Saved"}
          </span>
          <Button onClick={save} loading={saving} disabled={!dirty} size="sm">
            Save
          </Button>
        </div>
      </div>

      {tab === "write" ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="# Shared notes&#10;&#10;Sketch what you're building. Markdown is welcome."
          className="min-h-[440px] rounded-none border-0 bg-transparent focus:border-0 font-mono text-[13px] leading-[1.75] px-5 py-4"
        />
      ) : (
        <div className="min-h-[440px] px-5 py-4 overflow-y-auto">
          {content.trim() ? (
            <Markdown source={content} />
          ) : (
            <p className="text-sm text-[var(--color-fg-muted)]">Nothing to preview yet.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-fg-dim)]">
        <span className="truncate">
          {updatedAt
            ? `Saved ${formatRelative(updatedAt)}${updatedByName ? ` · ${updatedByName}` : ""}`
            : "Never saved yet"}
        </span>
        <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] font-mono text-[10px]">
          Ctrl+S
        </kbd>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 h-6 rounded text-[11px] font-medium transition-colors",
        active
          ? "bg-[var(--color-bg)] text-[var(--color-fg)] shadow-sm"
          : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]",
      )}
    >
      {children}
    </button>
  );
}

function Markdown({ source }: { source: string }) {
  return (
    <div className="text-sm text-[var(--color-fg)] leading-relaxed">
      <ReactMarkdown
        components={{
          h1: (props) => <h1 className="text-xl font-semibold mt-4 mb-2 first:mt-0" {...props} />,
          h2: (props) => <h2 className="text-lg font-semibold mt-4 mb-2 first:mt-0" {...props} />,
          h3: (props) => <h3 className="text-base font-semibold mt-3 mb-1.5 first:mt-0" {...props} />,
          p: (props) => <p className="mb-2.5 leading-relaxed" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 mb-2.5 space-y-1" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 mb-2.5 space-y-1" {...props} />,
          li: (props) => <li className="leading-relaxed" {...props} />,
          a: (props) => (
            <a
              className="text-[var(--color-accent-2)] hover:underline"
              target="_blank"
              rel="noreferrer"
              {...props}
            />
          ),
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-[var(--color-accent)]/60 pl-3 italic text-[var(--color-fg-muted)] my-3"
              {...props}
            />
          ),
          pre: (props) => (
            <pre
              className="p-3 rounded-md bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] text-[12px] font-mono overflow-x-auto my-3"
              {...props}
            />
          ),
          code: ({ className, ...props }) => (
            <code
              className={cn(
                "font-mono text-[12px]",
                // inline (no language- prefix from rehype-highlight, no parent pre)
                !className && "px-1 py-0.5 rounded bg-[var(--color-bg-elev-2)] border border-[var(--color-border)]",
                className,
              )}
              {...props}
            />
          ),
          hr: () => <hr className="my-4 border-[var(--color-border)]" />,
          strong: (props) => <strong className="font-semibold text-[var(--color-fg)]" {...props} />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
