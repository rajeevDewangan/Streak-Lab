"use client";

import * as React from "react";
import { toast } from "sonner";
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/utils";
import {
  createCategoryNote,
  updateCategoryNote,
  deleteCategoryNote,
} from "@/lib/actions/notes";
import type { CategoryNoteWithAuthor } from "@/lib/types";

type Props = {
  categoryId: string;
  categoryColor: string;
  notes: CategoryNoteWithAuthor[];
  currentUserId: string;
};

export function CategoryNotes({ categoryId, categoryColor, notes, currentUserId }: Props) {
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<CategoryNoteWithAuthor | null>(null);
  const [editing, setEditing] = React.useState<CategoryNoteWithAuthor | null>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold inline-flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" />
          Notes &amp; guides
          <span className="text-xs font-normal text-[var(--color-fg-muted)]">
            ({notes.length})
          </span>
        </h2>
        <Button size="sm" variant="secondary" onClick={() => setComposerOpen(true)}>
          <Plus className="h-3 w-3" /> Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="surface p-8 text-center text-sm text-[var(--color-fg-muted)]">
          No notes yet. Share how you learned something — resources, tips, your journey.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setViewing(n)}
              className="surface p-4 text-left hover:border-[var(--color-border-strong)] transition-colors flex flex-col gap-2 min-h-[7rem]"
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: categoryColor }}
                />
                <h3 className="text-sm font-semibold leading-snug line-clamp-2 flex-1">
                  {n.topic}
                </h3>
              </div>
              <p className="font-mono text-[11px] text-[var(--color-fg-muted)] line-clamp-3 whitespace-pre overflow-hidden">
                {n.content}
              </p>
              <div className="mt-auto flex items-center justify-between text-[11px] text-[var(--color-fg-dim)] pt-1">
                <span className="font-medium text-[var(--color-fg-muted)]">
                  {n.author?.name ?? "—"}
                </span>
                <span>{formatRelative(n.created_at)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      <NoteComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        categoryId={categoryId}
      />

      <NoteComposer
        open={!!editing}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
        }}
        categoryId={categoryId}
        note={editing ?? undefined}
      />

      <NoteViewer
        note={viewing}
        onOpenChange={(v) => {
          if (!v) setViewing(null);
        }}
        currentUserId={currentUserId}
        onEdit={(n) => {
          setViewing(null);
          setEditing(n);
        }}
        onDeleted={() => setViewing(null)}
      />
    </section>
  );
}

function NoteComposer({
  open,
  onOpenChange,
  categoryId,
  note,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categoryId: string;
  note?: CategoryNoteWithAuthor;
}) {
  const isEdit = !!note;
  const [topic, setTopic] = React.useState("");
  const [content, setContent] = React.useState("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTopic(note?.topic ?? "");
      setContent(note?.content ?? "");
    }
  }, [open, note]);

  async function submit() {
    if (!topic.trim()) return toast.error("Topic required");
    if (!content.trim()) return toast.error("Write something first");
    setPending(true);
    const res = isEdit
      ? await updateCategoryNote(note!.id, { topic, content })
      : await createCategoryNote({ categoryId, topic, content });
    setPending(false);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success(isEdit ? "Note updated" : "Note saved");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit note" : "New note"}
      description="Share how you learned this — resources, links, your journey. Visible to everyone."
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Topic
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Tenses, Two-pointer pattern, useEffect cleanup"
            autoFocus
          />
        </div>

        <div>
          <label className="text-[11px] font-medium text-[var(--color-fg-muted)] uppercase tracking-wide mb-2 block">
            Note
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder={"What did you learn, and how?\n\nResources:\n- https://…\n\nGotchas: …"}
            className="min-h-[18rem] font-mono text-[13px]"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button onClick={submit} loading={pending}>
            {isEdit ? "Save" : "Post note"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function NoteViewer({
  note,
  onOpenChange,
  currentUserId,
  onEdit,
  onDeleted,
}: {
  note: CategoryNoteWithAuthor | null;
  onOpenChange: (v: boolean) => void;
  currentUserId: string;
  onEdit: (n: CategoryNoteWithAuthor) => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = React.useState(false);

  if (!note) return null;
  const mine = note.user_id === currentUserId;

  async function handleDelete() {
    if (!note) return;
    if (!confirm("Delete this note?")) return;
    setDeleting(true);
    const res = await deleteCategoryNote(note.id);
    setDeleting(false);
    if ("error" in res && res.error) return toast.error(res.error);
    toast.success("Note deleted");
    onDeleted();
  }

  return (
    <Dialog
      open={!!note}
      onOpenChange={onOpenChange}
      className="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        <div className="pr-8">
          <h2 className="text-lg font-semibold tracking-tight">{note.topic}</h2>
          <p className="text-xs text-[var(--color-fg-muted)] mt-1">
            by <span className="font-medium text-[var(--color-fg)]">{note.author?.name ?? "—"}</span>
            {" · "}
            {formatRelative(note.created_at)}
            {note.updated_at !== note.created_at && (
              <span className="text-[var(--color-fg-dim)]"> · edited</span>
            )}
          </p>
        </div>

        <div className="font-mono text-[13px] whitespace-pre leading-[1.75] max-h-[60vh] overflow-auto pr-1">
          <LinkifiedText text={note.content} />
        </div>

        {mine && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onEdit(note)}>
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function LinkifiedText({ text }: { text: string }) {
  const parts = React.useMemo(() => {
    const urlRe = /(https?:\/\/[^\s)]+)/g;
    const out: Array<{ kind: "text" | "link"; value: string }> = [];
    let last = 0;
    for (const m of text.matchAll(urlRe)) {
      const start = m.index ?? 0;
      if (start > last) out.push({ kind: "text", value: text.slice(last, start) });
      out.push({ kind: "link", value: m[0] });
      last = start + m[0].length;
    }
    if (last < text.length) out.push({ kind: "text", value: text.slice(last) });
    return out;
  }, [text]);

  return (
    <>
      {parts.map((p, i) =>
        p.kind === "link" ? (
          <a
            key={i}
            href={p.value}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-fg)] underline underline-offset-2 hover:opacity-80 break-all"
          >
            {p.value}
          </a>
        ) : (
          <React.Fragment key={i}>{p.value}</React.Fragment>
        ),
      )}
    </>
  );
}
