import { RotateCcw, Search } from "lucide-react";

import { jobPriorityOptions, jobStatusOptions } from "../../utils/job-utils";

export default function JobFilters({ filters, onChange, onReset }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/55 p-4 lg:grid-cols-[minmax(220px,1fr)_180px_160px_auto]">
      <label className="relative block">
        <span className="sr-only">Search jobs</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        <input
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search number, title, type, or reference"
          className="h-11 w-full rounded-xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/70 focus:ring-4 focus:ring-emerald-400/10"
        />
      </label>

      <select
        value={filters.status}
        onChange={(event) => update("status", event.target.value)}
        className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70"
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        {jobStatusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.priority}
        onChange={(event) => update("priority", event.target.value)}
        className="h-11 rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-emerald-400/70"
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        {jobPriorityOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="flex items-center justify-between gap-3 lg:justify-end">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <input
            type="checkbox"
            checked={filters.includeInactive}
            onChange={(event) => update("includeInactive", event.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-emerald-400"
          />
          Inactive
        </label>
        <button
          type="button"
          onClick={onReset}
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Reset filters"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
