import { Plus } from "lucide-react";
import { loadAppData } from "@/lib/data";
import { Heatmap } from "@/components/heatmap";
import { CategoryCard } from "@/components/category-card";
import { FeedItem } from "@/components/feed-item";
import { StreakCards } from "@/components/streak-stat";
import { NewCategoryButton } from "./new-category-button";
import { computeStreak } from "@/lib/streak";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { me, others, categories, entries } = await loadAppData();

  const myEntries = entries.filter((e) => e.user_id === me?.id);
  const myStreak = computeStreak(myEntries.map((e) => e.local_date));
  const otherStreaks = others.map((o) => ({
    id: o.id,
    name: o.name,
    streak: computeStreak(entries.filter((e) => e.user_id === o.id).map((e) => e.local_date)),
  }));

  const recent = entries.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-fg-muted)] uppercase tracking-wide">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
            {myStreak.loggedToday ? (
              <>Nice. Streak is alive.</>
            ) : myStreak.current > 0 ? (
              <>One log keeps the {myStreak.current}-day streak going.</>
            ) : (
              <>Start the streak. One log today.</>
            )}
          </h1>
        </div>
      </header>

      <StreakCards
        me={myStreak}
        meName={me?.name ?? "You"}
        others={otherStreaks}
      />

      <section>
        <div className="surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Your contribution graph</h2>
              <p className="text-xs text-[var(--color-fg-muted)]">
                Click any day to see the proofs.
              </p>
            </div>
            <Link href="/heatmap" className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline underline-offset-2">
              See all heatmaps →
            </Link>
          </div>
          <Heatmap entries={entries} userId={me?.id ?? null} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Categories</h2>
          <NewCategoryButton />
        </div>

        {categories.length === 0 ? (
          <div className="surface p-8 text-center">
            <p className="text-sm text-[var(--color-fg-muted)] mb-4">
              No categories yet. Create your first one to start logging proofs.
            </p>
            <NewCategoryButton label="Create your first category" icon={<Plus className="h-3.5 w-3.5" />} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} entries={entries} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          <Link href="/feed" className="text-xs text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] underline underline-offset-2">
            View full feed →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="surface p-8 text-center text-sm text-[var(--color-fg-muted)]">
            No activity yet. Be the first to log proof today.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((e) => (
              <FeedItem key={e.id} entry={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
