import { RotateCcw, Search } from "lucide-react";

import { assetStatusOptions, assetTypeOptions } from "../../utils/asset-utils";

export default function EquipmentFilters({ filters, onChange, onReset }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px_auto_auto] xl:items-end">
        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Search equipment
          </span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) =>
                onChange({ ...filters, search: event.target.value })
              }
              placeholder="Name, reference, or location"
              className="h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Equipment type
          </span>
          <select
            value={filters.assetType}
            onChange={(event) =>
              onChange({ ...filters, assetType: event.target.value })
            }
            className="h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">All types</option>
            {assetTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Status
          </span>
          <select
            value={filters.status}
            onChange={(event) =>
              onChange({ ...filters, status: event.target.value })
            }
            className="h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="">All statuses</option>
            {assetStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(event) =>
              onChange({ ...filters, availableOnly: event.target.checked })
            }
            className="h-4 w-4 accent-emerald-400"
          />
          Available only
        </label>

        <div className="flex gap-2">
          <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={filters.includeInactive}
              onChange={(event) =>
                onChange({ ...filters, includeInactive: event.target.checked })
              }
              className="h-4 w-4 accent-emerald-400"
            />
            Include inactive
          </label>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-700 px-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>
    </section>
  );
}
