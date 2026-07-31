import { UserRoundPlus, UsersRound } from "lucide-react";
import { Link } from "react-router";

export default function TeamsEmptyState({ canCreate, filtered }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/35 px-6 py-20 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-500">
        <UsersRound className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-white">
        {filtered ? "No team members match these filters" : "No workforce profiles yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Adjust the search or filter options to see other records."
          : "Add registered Novera users to the workspace and create their operational workforce profiles."}
      </p>
      {!filtered && canCreate ? (
        <Link
          to="/teams/new"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          <UserRoundPlus className="h-4 w-4" /> Add team member
        </Link>
      ) : null}
    </section>
  );
}
