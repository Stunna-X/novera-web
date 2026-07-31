import { Drill, Plus } from "lucide-react";
import { Link } from "react-router";

export default function EquipmentEmptyState({ filtered = false, canCreate = false }) {
  return (
    <section className="grid min-h-[320px] place-items-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/35 px-6 py-12 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-800/70 text-slate-300">
          <Drill className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-white">
          {filtered ? "No equipment matches these filters" : "No equipment registered yet"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {filtered
            ? "Reset the filters or search with a different name, reference, or location."
            : "Register rigs, pumps, vehicles, generators, machines, and tools so they can be tracked and assigned to field jobs."}
        </p>
        {!filtered && canCreate ? (
          <Link
            to="/equipment/new"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4" /> Register equipment
          </Link>
        ) : null}
      </div>
    </section>
  );
}
