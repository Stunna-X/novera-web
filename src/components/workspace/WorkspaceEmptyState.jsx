import { Building2, Plus } from "lucide-react";
import { Link } from "react-router";

export default function WorkspaceEmptyState({ returnTo = "/dashboard" }) {
  return (
    <section className="grid min-h-[460px] place-items-center rounded-3xl border border-slate-800 bg-slate-900/55 px-6 py-16 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
          <Building2 className="h-7 w-7" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Workspace required
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Create your operational workspace
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          Jobs are organisation-scoped in Novera. Create a workspace first, then add customers, sites, teams, equipment, and field jobs.
        </p>
        <Link
          to="/workspace/setup"
          state={{ from: returnTo }}
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          Create workspace
        </Link>
      </div>
    </section>
  );
}
