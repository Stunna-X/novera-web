import { CheckCircle2, Clock3 } from "lucide-react";

export default function AvailabilityBadge({ available }) {
  const Icon = available ? CheckCircle2 : Clock3;

  return (
    <span
      className={
        available
          ? "inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300"
          : "inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"
      }
    >
      <Icon className="h-3.5 w-3.5" />
      {available ? "Available" : "Unavailable"}
    </span>
  );
}
