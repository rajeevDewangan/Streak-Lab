import { loadAppData } from "@/lib/data";
import { FeedItem } from "@/components/feed-item";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const { entries } = await loadAppData();

  // Group by day
  const groups = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = groups.get(e.local_date) ?? [];
    list.push(e);
    groups.set(e.local_date, list);
  }
  const sortedKeys = [...groups.keys()].sort().reverse();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Shared feed</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">
          Live activity from both of you. Realtime, no refresh needed.
        </p>
      </header>

      {sortedKeys.length === 0 && (
        <div className="surface p-10 text-center">
          <p className="text-sm text-[var(--color-fg-muted)]">
            Nothing here yet. Make the first move.
          </p>
        </div>
      )}

      {sortedKeys.map((key) => {
        const day = new Date(key);
        return (
          <div key={key} className="flex flex-col gap-2">
            <h2 className="text-xs uppercase tracking-wide text-[var(--color-fg-dim)] px-1">
              {day.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h2>
            <div className="flex flex-col gap-2">
              {groups.get(key)!.map((e) => (
                <FeedItem key={e.id} entry={e} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
