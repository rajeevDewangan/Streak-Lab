import { redirect } from "next/navigation";
import { FileText, MessageCircle } from "lucide-react";
import { getSession, getSupabaseServer } from "@/lib/supabase/server";
import { NotesEditor } from "./notes-editor";
import { ChatPanel } from "./chat-panel";

export const dynamic = "force-dynamic";

type ChatRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  name: string;
  avatar_url: string | null;
};

type DocRow = {
  content: string;
  updated_at: string;
  updated_by: string | null;
};

export default async function NotesPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  const supabase = await getSupabaseServer();

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const [docRes, messagesRes, profilesRes] = await Promise.all([
    supabase.from("shared_doc").select("content,updated_at,updated_by").eq("id", 1).maybeSingle(),
    supabase
      .from("chat_messages")
      .select("id,user_id,content,created_at")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id,name,avatar_url"),
  ]);

  const doc = (docRes.data ?? null) as DocRow | null;
  const messages = (messagesRes.data ?? []) as ChatRow[];
  const profiles = (profilesRes.data ?? []) as ProfileRow[];

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  const me = profileMap.get(user.id) ?? null;
  const editorName = doc?.updated_by ? profileMap.get(doc.updated_by)?.name ?? null : null;

  const decorated = messages.map((m) => ({
    id: m.id,
    user_id: m.user_id,
    content: m.content,
    created_at: m.created_at,
    author: profileMap.get(m.user_id)?.name ?? "Unknown",
    mine: m.user_id === user.id,
  }));

  const wordCount = doc?.content?.trim() ? doc.content.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-fg-muted)] uppercase tracking-wide">
            Shared workspace
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
            Notes &amp; chat
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1.5">
            Docs aren&apos;t realtime — hit save to publish. Chat keeps the last 30 days.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatPill icon={<FileText className="h-3 w-3" />} value={wordCount} label="words" />
          <StatPill
            icon={<MessageCircle className="h-3 w-3" />}
            value={decorated.length}
            label="msgs · 30d"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-4 items-start">
        <NotesEditor
          initialContent={doc?.content ?? ""}
          updatedAt={doc?.updated_at ?? null}
          updatedByName={editorName}
        />
        <ChatPanel messages={decorated} meName={me?.name ?? "You"} />
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-[var(--color-bg-elev)] border border-[var(--color-border)] text-[11px] text-[var(--color-fg-muted)]">
      <span className="text-[var(--color-fg-dim)]">{icon}</span>
      <span className="font-semibold text-[var(--color-fg)] tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}
