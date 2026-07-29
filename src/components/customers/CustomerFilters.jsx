import { RotateCcw, Search } from "lucide-react";

export default function CustomerFilters({ filters, onChange, onReset }) {
  return (
    <section className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/55 p-4 md:grid-cols-[1fr_auto_auto] md:items-end">
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Search customers
        </span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              onChange((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Name, contact, email, or phone"
            className="h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
          />
        </span>
      </label>

      <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={filters.includeInactive}
          onChange={(event) =>
            onChange((current) => ({
              ...current,
              includeInactive: event.target.checked,
            }))
          }
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-emerald-400"
        />
        Include inactive
      </label>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
      >
        <RotateCcw className="h-4 w-4" /> Reset
      </button>
    </section>
  );
}
