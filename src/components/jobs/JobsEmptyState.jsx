import { BriefcaseBusiness, Plus } from "lucide-react";
import { Link } from "react-router";

export default function JobsEmptyState({ canCreate, filtered }) {
  return (
    <section className="grid min-h-[360px] place-items-center rounded-2xl border border-slate-800 bg-slate-900/55 px-6 py-14 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-800/70 text-slate-400">
          <BriefcaseBusiness className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-white">
          {filtered ? "No jobs match these filters" : "No jobs yet"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {filtered
            ? "Clear or change the filters to broaden your results."
            : "Create the first field job when your customer and site records are ready."}
        </p>
        {!filtered && canCreate && (
          <Link
            to="/jobs/new"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4" />
            Create first job
          </Link>
        )}
      </div>
    </section>
  );
}
