import { cn } from "../../utils/cn";
import { humanizeAssetValue } from "../../utils/asset-utils";

const styles = {
  excellent: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  good: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  fair: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  poor: "border-orange-400/20 bg-orange-400/10 text-orange-200",
  damaged: "border-rose-400/20 bg-rose-400/10 text-rose-200",
};

export default function AssetConditionBadge({ condition, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        styles[condition] || styles.fair,
        className,
      )}
    >
      {humanizeAssetValue(condition, "Unknown")}
    </span>
  );
}
