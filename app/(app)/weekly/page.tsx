import { loadAppData } from "@/lib/data";
import { toLocalDateKey } from "@/lib/utils";
import { CatIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const MEMBER_COLORS = [
  "var(--color-accent-2)",
  "var(--color-accent-3, #f59e0b)",
  "var(--color-accent-4, #a855f7)",
  "var(--color-accent-5, #ec4899)",
  "var(--color-accent-6, #14b8a6)",
];

export default async function WeeklyPage() {
  const { me, others, categories, entries } = await loadAppData();

  // Last 7 days including today
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  const dayKeys = days.map(toLocalDateKey);
  const dayKeySet = new Set(dayKeys);

  const weekEntries = entries.filter((e) => dayKeySet.has(e.local_date));
  const myWeek = weekEntries.filter((e) => e.user_id === me?.id);

  const myCountByDay: Record<string, number> = {};
  for (const k of dayKeys) myCountByDay[k] = 0;
  for (const e of myWeek) myCountByDay[e.local_date] = (myCountByDay[e.local_date] ?? 0) + 1;

  type MemberSeries = {
    id: string;
    name: string;
    color: string;
    countByDay: Record<string, number>;
    total: number;
  };

  const otherSeries: MemberSeries[] = others.map((o, i) => {
    const ownWeek = weekEntries.filter((e) => e.user_id === o.id);
    const countByDay: Record<string, number> = {};
    for (const k of dayKeys) countByDay[k] = 0;
    for (const e of ownWeek) countByDay[e.local_date] = (countByDay[e.local_date] ?? 0) + 1;
    return {
      id: o.id,
      name: o.name,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
      countByDay,
      total: ownWeek.length,
    };
  });

  // Most active category (mine)
  const byCat: Record<string, number> = {};
  for (const e of myWeek) byCat[e.category_id] = (byCat[e.category_id] ?? 0) + 1;
  const sortedCats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const topCatId = sortedCats[0]?.[0];
  const topCat = categories.find((c) => c.id === topCatId);

  // Missed days (mine)
  const missed = dayKeys.filter((k) => myCountByDay[k] === 0).length;
  const activeDays = 7 - missed;

  const allCounts = [
    ...Object.values(myCountByDay),
    ...otherSeries.flatMap((s) => Object.values(s.countByDay)),
  ];
  const maxCount = Math.max(1, ...allCounts);

  const friendsSub =
    otherSeries.length === 0
      ? "solo this week"
      : otherSeries
          .map((s) => `${s.total} from ${s.name}`)
          .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Weekly review</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">
          Last 7 days — {dayKeys[0]} → {dayKeys[6]}
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total logs" value={myWeek.length} sub={friendsSub} />
        <Stat label="Active days" value={`${activeDays}/7`} sub={missed === 0 ? "Perfect week ✓" : `${missed} missed`} />
        <Stat
          label="Most active category"
          value={topCat?.name ?? "—"}
          sub={topCat ? `${sortedCats[0][1]} logs` : "No logs yet"}
        />
        <Stat
          label="Avg logs/day"
          value={(myWeek.length / 7).toFixed(1)}
          sub="across active categories"
        />
      </section>

      <section className="surface p-5">
        <h2 className="text-sm font-semibold mb-4">Daily activity</h2>
        <div className="flex items-end gap-3 h-40">
          {dayKeys.map((k, i) => {
            const mine = myCountByDay[k];
            const myHeight = (mine / maxCount) * 100;
            return (
              <div key={k} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div className="w-full flex items-end gap-1 h-32">
                  <div
                    className="flex-1 rounded-t-sm bg-[var(--color-accent)] transition-all duration-700"
                    style={{ height: `${myHeight}%` }}
                    title={`${mine} log${mine === 1 ? "" : "s"}`}
                  />
                  {otherSeries.map((s) => {
                    const c = s.countByDay[k];
                    const h = (c / maxCount) * 100;
                    return (
                      <div
                        key={s.id}
                        className="flex-1 rounded-t-sm transition-all duration-700 opacity-70"
                        style={{ height: `${h}%`, backgroundColor: s.color }}
                        title={`${s.name}: ${c} log${c === 1 ? "" : "s"}`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-[var(--color-fg-dim)] uppercase">
                  {days[i].toLocaleDateString(undefined, { weekday: "short" })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-4 text-xs text-[var(--color-fg-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--color-accent)]" /> {me?.name ?? "You"}
          </span>
          {otherSeries.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm opacity-70"
                style={{ backgroundColor: s.color }}
              />{" "}
              {s.name}
            </span>
          ))}
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="text-sm font-semibold mb-3">Breakdown by category (you)</h2>
        {sortedCats.length === 0 ? (
          <p className="text-sm text-[var(--color-fg-muted)]">No logs this week.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedCats.map(([id, count]) => {
              const cat = categories.find((c) => c.id === id);
              if (!cat) return null;
              const pct = Math.round((count / myWeek.length) * 100);
              return (
                <div key={id} className="flex items-center gap-3">
                  <div
                    className="h-7 w-7 rounded-md grid place-items-center shrink-0"
                    style={{ backgroundColor: `${cat.color}26`, color: cat.color }}
                  >
                    <CatIcon name={cat.icon} className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{cat.name}</span>
                      <span className="text-xs text-[var(--color-fg-muted)]">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-bg-elev-2)] overflow-hidden">
                      <div
                        className="h-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="surface p-5">
        <h2 className="text-sm font-semibold mb-3">Missed days</h2>
        <div className="flex flex-wrap gap-2">
          {dayKeys.map((k, i) => {
            const c = myCountByDay[k];
            return (
              <Badge
                key={k}
                color={c === 0 ? "#f85149" : "#39d353"}
                className="font-mono"
              >
                {days[i].toLocaleDateString(undefined, { weekday: "short" })} — {c === 0 ? "✗" : `${c}`}
              </Badge>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="surface p-4">
      <div className="text-xs text-[var(--color-fg-muted)] mb-1">{label}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-fg-dim)] mt-1">{sub}</div>}
    </div>
  );
}
