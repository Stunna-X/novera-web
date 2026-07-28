import { Link } from "react-router";

import { cn } from "../../utils/cn";

export default function NoveraLogo({ compact = false, className = "" }) {
  return (
    <Link
      to="/dashboard"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Novera dashboard"
    >
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-400/10 shadow-[0_0_32px_rgba(52,211,153,0.12)]">
        <span className="absolute inset-x-2 top-2 h-4 rotate-45 rounded-sm border border-emerald-300/60" />
        <span className="absolute inset-x-2 bottom-2 h-4 -rotate-45 rounded-sm border border-emerald-300/60" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
      </span>

      {!compact && (
        <span>
          <span className="block text-base font-semibold tracking-[0.18em] text-white">
            NOVERA
          </span>
          <span className="block text-[10px] uppercase tracking-[0.24em] text-slate-500">
            Field team first
          </span>
        </span>
      )}
    </Link>
  );
}
