import { ChevronRight, MapPin, Wrench } from "lucide-react";
import { Link } from "react-router";

import AssetConditionBadge from "./AssetConditionBadge";
import AssetStatusBadge from "./AssetStatusBadge";
import { humanizeAssetValue } from "../../utils/asset-utils";

export default function EquipmentTable({ assets, workloadByAssetId }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="hidden grid-cols-[minmax(240px,1.2fr)_minmax(150px,.7fr)_minmax(180px,.85fr)_minmax(180px,.9fr)_120px_28px] gap-4 border-b border-slate-800 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 lg:grid">
        <span>Equipment</span>
        <span>Type</span>
        <span>State</span>
        <span>Location</span>
        <span>Assignments</span>
        <span />
      </div>

      <div className="divide-y divide-slate-800">
        {assets.map((asset) => {
          const workload = workloadByAssetId?.get(asset.id);

          return (
            <Link
              key={asset.id}
              to={`/equipment/${asset.id}`}
              className="grid gap-4 px-5 py-5 transition hover:bg-slate-800/25 lg:grid-cols-[minmax(240px,1.2fr)_minmax(150px,.7fr)_minmax(180px,.85fr)_minmax(180px,.9fr)_120px_28px] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Wrench className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{asset.name}</p>
                    <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.12em] text-emerald-300">
                      {asset.asset_code}
                    </p>
                  </div>
                </div>
                {!asset.is_active ? (
                  <p className="mt-2 text-xs font-medium text-rose-300">Inactive record</p>
                ) : null}
              </div>

              <p className="text-sm text-slate-300">
                {humanizeAssetValue(asset.asset_type)}
              </p>

              <div className="flex flex-wrap gap-2">
                <AssetStatusBadge status={asset.status} />
                <AssetConditionBadge condition={asset.condition} />
              </div>

              <p className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{asset.location || "No location recorded"}</span>
              </p>

              <div className="text-sm font-semibold text-slate-300">
                {workload ? `${workload.open_assignment_count} open` : "—"}
              </div>

              <ChevronRight className="h-4 w-4 text-slate-600" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
