import { cn } from "../../utils/cn";
import { humanizeTeamValue } from "../../utils/team-utils";

const variants = {
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  inactive: "border-slate-600/40 bg-slate-700/30 text-slate-300",
  on_leave: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  suspended: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

export default function WorkforceStatusBadge({ status, className }) {
  const normalized = status || "inactive";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        variants[normalized] || variants.inactive,
        className,
      )}
    >
      {humanizeTeamValue(normalized)}
    </span>
  );
}
