import { cn } from "../../utils/cn";
import { getJobStatusLabel } from "../../utils/job-utils";

const styles = {
  draft: "border-slate-600/40 bg-slate-700/30 text-slate-300",
  scheduled: "border-sky-400/25 bg-sky-400/10 text-sky-200",
  dispatched: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  in_progress: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  on_hold: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  completed: "border-teal-400/25 bg-teal-400/10 text-teal-200",
  cancelled: "border-rose-400/25 bg-rose-400/10 text-rose-200",
};

export default function JobStatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        styles[status] || styles.draft,
        className,
      )}
    >
      {getJobStatusLabel(status)}
    </span>
  );
}
