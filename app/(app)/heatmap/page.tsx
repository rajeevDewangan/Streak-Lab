import { loadAppData } from "@/lib/data";
import { Heatmap } from "@/components/heatmap";
import { CatIcon } from "@/components/ui/icon";

export const dynamic = "force-dynamic";

export default async function HeatmapPage() {
  const { me, others, categories, entries } = await loadAppData();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Heatmaps</h1>
        <p className="text-sm text-[var(--color-fg-muted)] mt-1">
          Lighter blue = more logs.
        </p>
      </header>

      <section className="surface p-5">
        <h2 className="text-sm font-semibold mb-1">Combined (everyone, all categories)</h2>
        <p className="text-xs text-[var(--color-fg-muted)] mb-4">
          Whole-team consistency view.
        </p>
        <Heatmap entries={entries} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="surface p-5">
          <h2 className="text-sm font-semibold mb-1">{me?.name ?? "You"}</h2>
          <p className="text-xs text-[var(--color-fg-muted)] mb-4">All your categories.</p>
          <Heatmap entries={entries} userId={me?.id ?? null} />
        </div>
        {others.map((o) => (
          <div key={o.id} className="surface p-5">
            <h2 className="text-sm font-semibold mb-1">{o.name}</h2>
            <p className="text-xs text-[var(--color-fg-muted)] mb-4">All their categories.</p>
            <Heatmap entries={entries} userId={o.id} />
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">By category</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="surface p-5">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="h-7 w-7 rounded-md grid place-items-center"
                  style={{ backgroundColor: `${c.color}26`, color: c.color }}
                >
                  <CatIcon name={c.icon} className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold">{c.name}</h3>
              </div>
              <p className="text-xs text-[var(--color-fg-muted)] mb-3">
                Combined across everyone.
              </p>
              <Heatmap entries={entries} categoryId={c.id} />
            </div>
          ))}
          {categories.length === 0 && (
            <div className="surface p-8 text-center text-sm text-[var(--color-fg-muted)]">
              No categories yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
