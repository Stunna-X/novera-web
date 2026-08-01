import { cn } from "../../utils/cn";

const tones = {
  emerald: "bg-emerald-400/10 text-emerald-300",
  amber: "bg-amber-400/10 text-amber-300",
  rose: "bg-rose-400/10 text-rose-300",
  sky: "bg-sky-400/10 text-sky-300",
  violet: "bg-violet-400/10 text-violet-300",
  slate: "bg-slate-800 text-slate-300",
};

export default function DashboardMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "emerald",
  loading = false,
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-3 h-9 w-20 animate-pulse rounded-lg bg-slate-800" />
          ) : (
            <p className="mt-3 truncate text-3xl font-semibold tracking-tight text-white">
              {value}
            </p>
          )}
        </div>
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
            tones[tone] || tones.emerald,
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-4 min-h-4 text-xs text-slate-600">{detail}</p>
    </article>
  );
}
