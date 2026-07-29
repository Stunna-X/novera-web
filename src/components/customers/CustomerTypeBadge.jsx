import { Building2, UserRound } from "lucide-react";

export default function CustomerTypeBadge({ type }) {
  const isIndividual = type === "individual";
  const Icon = isIndividual ? UserRound : Building2;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-300">
      <Icon className="h-3.5 w-3.5 text-emerald-300" />
      {isIndividual ? "Individual" : "Business"}
    </span>
  );
}
