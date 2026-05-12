"use client";

import * as React from "react";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { sendChat } from "@/lib/actions/chat";
import { cn, toLocalDateKey } from "@/lib/utils";

type ChatMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: string;
  mine: boolean;
};

type Item =
  | { kind: "divider"; key: string; label: string }
  | { kind: "message"; key: string; m: ChatMessage; showHeader: boolean };

function dayLabel(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return target.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ChatPanel({
  messages,
  meName,
}: {
  messages: ChatMessage[];
  meName: string;
}) {
  const [draft, setDraft] = React.useState("");
  const [sending, startSending] = React.useTransition();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  function send() {
    const t = draft.trim();
    if (!t) return;
    startSending(async () => {
      const res = await sendChat(t);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      setDraft("");
    });
  }

  const items: Item[] = [];
  let lastDate = "";
  let lastSender = "";
  let lastTime = 0;
  for (const m of messages) {
    const localKey = toLocalDateKey(new Date(m.created_at));
    if (localKey !== lastDate) {
      items.push({
        kind: "divider",
        key: `d-${localKey}`,
        label: dayLabel(new Date(m.created_at)),
      });
      lastDate = localKey;
      lastSender = "";
    }
    const t = new Date(m.created_at).getTime();
    const showHeader = m.user_id !== lastSender || t - lastTime > 5 * 60 * 1000;
    items.push({ kind: "message", key: m.id, m, showHeader });
    lastSender = m.user_id;
    lastTime = t;
  }

  return (
    <section className="surface flex flex-col overflow-hidden h-[56vh] lg:sticky lg:top-[72px] lg:h-[calc((100dvh-96px)*0.8)]">
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[var(--color-border)]">
        <div className="h-7 w-7 rounded-md bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] grid place-items-center">
          <MessageCircle className="h-3.5 w-3.5 text-[var(--color-fg-muted)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold leading-tight">Chat</h2>
          <p className="text-[10px] text-[var(--color-fg-dim)] leading-tight mt-0.5">
            Last 30 days · {messages.length} message{messages.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-1.5"
      >
        {items.length === 0 ? (
          <div className="m-auto text-center max-w-[260px] py-10">
            <div className="h-10 w-10 rounded-full bg-[var(--color-bg-elev-2)] grid place-items-center mx-auto mb-3">
              <MessageCircle className="h-4 w-4 text-[var(--color-fg-dim)]" />
            </div>
            <p className="text-sm text-[var(--color-fg-muted)]">
              No messages in the last 30 days.
            </p>
            <p className="text-[11px] text-[var(--color-fg-dim)] mt-1">
              Say hi to break the silence.
            </p>
          </div>
        ) : (
          items.map((it) => {
            if (it.kind === "divider") {
              return (
                <div key={it.key} className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-fg-dim)] px-2">
                    {it.label}
                  </span>
                  <div className="flex-1 h-px bg-[var(--color-border)]" />
                </div>
              );
            }
            const { m, showHeader } = it;
            return (
              <div
                key={it.key}
                className={cn(
                  "flex gap-2",
                  m.mine ? "flex-row-reverse" : "flex-row",
                  showHeader ? "mt-1" : "-mt-0.5",
                )}
              >
                <div className={cn("h-7 w-7 shrink-0", !showHeader && "invisible")}>
                  <div
                    className={cn(
                      "h-full w-full rounded-full grid place-items-center text-[10px] font-semibold",
                      m.mine
                        ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
                        : "bg-[var(--color-bg-elev-2)] text-[var(--color-fg-muted)] border border-[var(--color-border)]",
                    )}
                  >
                    {m.author.slice(0, 1).toUpperCase()}
                  </div>
                </div>
                <div
                  className={cn(
                    "max-w-[78%] flex flex-col gap-0.5",
                    m.mine ? "items-end" : "items-start",
                  )}
                >
                  {showHeader && (
                    <div className="flex items-center gap-1.5 px-1 text-[10px] text-[var(--color-fg-dim)]">
                      <span className="font-medium text-[var(--color-fg-muted)]">
                        {m.author}
                      </span>
                      <span>·</span>
                      <span>{timeLabel(m.created_at)}</span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-1.5 text-[13px] leading-snug",
                      m.mine
                        ? "bg-[var(--color-fg)] text-[var(--color-bg)] rounded-br-sm"
                        : "bg-[var(--color-bg-elev)] border border-[var(--color-border)] rounded-bl-sm text-[var(--color-fg)]",
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="border-t border-[var(--color-border)] p-2.5 flex gap-2 items-end"
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message as ${meName}…`}
          disabled={sending}
          rows={1}
          className="min-h-[40px] max-h-[120px] text-sm py-2.5 leading-snug"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <Button
          type="submit"
          loading={sending}
          disabled={!draft.trim()}
          size="icon"
          aria-label="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </section>
  );
}
