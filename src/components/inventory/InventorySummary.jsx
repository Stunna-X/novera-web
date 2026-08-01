import { AlertTriangle, Boxes, MapPin, PackageCheck } from "lucide-react";

function SummaryCard({ label, value, description, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/55 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
    </article>
  );
}

export default function InventorySummary({ items, locations, balances, lowStock }) {
  const activeItems = items.filter((item) => item.is_active).length;
  const activeLocations = locations.filter((location) => location.is_active).length;
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Catalogue items"
        value={activeItems}
        description="Active materials and supplies"
        icon={Boxes}
      />
      <SummaryCard
        label="Stock locations"
        value={activeLocations}
        description="Active stores, yards, vehicles, and sites"
        icon={MapPin}
      />
      <SummaryCard
        label="Stock balances"
        value={balances.length}
        description="Item and location combinations with recorded stock"
        icon={PackageCheck}
      />
      <SummaryCard
        label="Low-stock alerts"
        value={lowStock.length}
        description="Items at or below their reorder level"
        icon={AlertTriangle}
      />
    </section>
  );
}
