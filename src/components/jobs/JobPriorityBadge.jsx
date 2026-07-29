import { cn } from "../../utils/cn";
import { getJobPriorityLabel } from "../../utils/job-utils";

const styles = {
  low: "text-slate-400",
  normal: "text-sky-300",
  high: "text-amber-300",
  urgent: "text-rose-300",
};

export default function JobPriorityBadge({ priority, className }) {
  return (
    <span className={cn("text-xs font-semibold", styles[priority], className)}>
      {getJobPriorityLabel(priority)}
    </span>
  );
}
