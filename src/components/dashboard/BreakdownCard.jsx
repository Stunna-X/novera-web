import { humanize } from "../../utils/job-utils";

const barTones = {
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
};

export default function BreakdownCard({
  title,
  items = [],
  tone = "emerald",
  emptyLabel = "No activity yet",
}) {
  const maximum = Math.max(0, ...items.map((item) => Number(item.count) || 0));

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">{title}</h2>

      {items.length === 0 ? (
        <div className="grid min-h-52 place-items-center text-sm text-slate-600">
          {emptyLabel}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {items.map((item) => {
            const count = Number(item.count) || 0;
            const width = maximum > 0 ? Math.max(3, (count / maximum) * 100) : 0;

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-400">
                    {humanize(item.label)}
                  </span>
                  <span className="font-semibold text-white">{count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${barTones[tone] || barTones.emerald}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
