import { Plus, Users } from "lucide-react";
import { Link } from "react-router";

export default function CustomersEmptyState({ canCreate, filtered }) {
  return (
    <section className="grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/35 px-6 py-16 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-800/70 text-slate-400">
          <Users className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-lg font-semibold text-white">
          {filtered ? "No customers match these filters" : "No customers yet"}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          {filtered
            ? "Adjust the search or include inactive records."
            : "Create the first customer to organise contacts, operational sites, and job history."}
        </p>
        {!filtered && canCreate ? (
          <Link
            to="/customers/new"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4" /> New customer
          </Link>
        ) : null}
      </div>
    </section>
  );
}
