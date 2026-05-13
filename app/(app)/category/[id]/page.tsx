import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { loadAppData } from "@/lib/data";
import { getSupabaseServer, getSession } from "@/lib/supabase/server";
import { Heatmap } from "@/components/heatmap";
import { FeedItem } from "@/components/feed-item";
import { CatIcon } from "@/components/ui/icon";
import { computeStreak } from "@/lib/streak";
import { CategoryActions } from "./category-actions";
import { CategoryNotes } from "./category-notes";
import type { CategoryNote, CategoryNoteWithAuthor, Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSession();
  if (!user) redirect("/login");

  const { categories, entries, profiles } = await loadAppData();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const catEntries = entries.filter((e) => e.category_id === id);
  const streak = computeStreak(catEntries.map((e) => e.local_date));

  const supabase = await getSupabaseServer();
  const { data: rawNotes } = await supabase
    .from("category_notes")
    .select("id,category_id,user_id,topic,content,created_at,updated_at")
    .eq("category_id", id)
    .order("created_at", { ascending: false });

  const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]));
  const notes: CategoryNoteWithAuthor[] = ((rawNotes ?? []) as CategoryNote[]).map((n) => {
    const author = profileMap.get(n.user_id);
    return {
      ...n,
      author: author
        ? { id: author.id, name: author.name, avatar_url: author.avatar_url }
        : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] w-fit"
      >
        <ChevronLeft className="h-3 w-3" /> Back to dashboard
      </Link>

      <header className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-xl grid place-items-center shrink-0"
          style={{ backgroundColor: `${category.color}26`, color: category.color }}
        >
          <CatIcon name={category.icon} className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{category.name}</h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-0.5">
            {catEntries.length} log{catEntries.length === 1 ? "" : "s"} ·{" "}
            <span style={{ color: category.color }}>{streak.current}-day streak</span> · best{" "}
            {streak.longest} days
          </p>
        </div>
        <CategoryActions category={category} />
      </header>

      <section className="surface p-5">
        <h2 className="text-sm font-semibold mb-3">Heatmap (both users)</h2>
        <Heatmap entries={entries} categoryId={id} />
      </section>

      <CategoryNotes
        categoryId={id}
        categoryColor={category.color}
        notes={notes}
        currentUserId={user.id}
      />

      <section>
        <h2 className="text-sm font-semibold mb-3">All logs</h2>
        {catEntries.length === 0 ? (
          <div className="surface p-10 text-center text-sm text-[var(--color-fg-muted)]">
            Nothing here yet. <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg-elev-2)] text-[10px]">Ctrl+K</kbd> to log.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {catEntries.map((e) => (
              <FeedItem key={e.id} entry={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
