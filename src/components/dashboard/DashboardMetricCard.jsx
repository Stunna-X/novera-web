import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "../../utils/cn";

const tones = {
  emerald: "bg-emerald-400/10 text-emerald-300",
  amber: "bg-amber-400/10 text-amber-300",
  rose: "bg-rose-400/10 text-rose-300",
  sky: "bg-sky-400/10 text-sky-300",
  violet: "bg-violet-400/10 text-violet-300",
  slate: "bg-slate-800 text-slate-300",
};

function MetricContent({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  loading,
  linked,
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

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

      <div className="mt-4 flex min-h-4 items-center justify-between gap-3">
        <p className="text-xs text-slate-600">{detail}</p>

        {linked && (
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-300" />
        )}
      </div>
    </>
  );
}

export default function DashboardMetricCard({
  label,
  value,
  detail,
  icon,
  tone = "emerald",
  loading = false,
  to = null,
}) {
  const className = cn(
    "rounded-2xl border border-slate-800 bg-slate-900/55 p-5",
    to &&
      "group block cursor-pointer transition hover:border-slate-700 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50",
  );

  const content = (
    <MetricContent
      label={label}
      value={value}
      detail={detail}
      icon={icon}
      tone={tone}
      loading={loading}
      linked={Boolean(to)}
    />
  );

  if (to) {
    return (
      <Link
        to={to}
        aria-label={`Open ${label.toLowerCase()} jobs`}
        className={className}
      >
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}