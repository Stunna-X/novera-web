import { INVENTORY_VIEWS } from "../../utils/inventory-utils";
import { cn } from "../../utils/cn";

export default function InventoryTabs({ value, onChange }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/55 p-1.5">
      <div className="flex min-w-max gap-1">
        {INVENTORY_VIEWS.map((view) => (
          <button
            key={view.value}
            type="button"
            onClick={() => onChange(view.value)}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition",
              value === view.value
                ? "bg-emerald-400/15 text-emerald-200"
                : "text-slate-400 hover:bg-slate-800 hover:text-white",
            )}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}
