import { cn } from "../../utils/cn";
import { humanizeAssetValue } from "../../utils/asset-utils";

const styles = {
  available: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  in_use: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  maintenance: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  unavailable: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  retired: "border-slate-600 bg-slate-800/80 text-slate-300",
};

export default function AssetStatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        styles[status] || styles.retired,
        className,
      )}
    >
      {humanizeAssetValue(status, "Unknown")}
    </span>
  );
}
