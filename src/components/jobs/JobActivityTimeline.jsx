import { Activity, ArrowRight } from "lucide-react";

import { formatDateTime, humanize } from "../../utils/job-utils";

export default function JobActivityTimeline({ activities, loading, error }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/55">
      <div className="border-b border-slate-800 px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-white">Activity timeline</h2>
        <p className="mt-1 text-xs text-slate-500">Operational changes recorded by the backend.</p>
      </div>

      <div className="p-5 sm:p-6">
        {loading && <p className="text-sm text-slate-500">Loading activities…</p>}
        {error && <p className="text-sm text-rose-300">Unable to load the activity timeline.</p>}
        {!loading && !error && activities.length === 0 && (
          <div className="py-8 text-center">
            <Activity className="mx-auto h-6 w-6 text-slate-600" />
            <p className="mt-3 text-sm text-slate-500">No recorded activity yet.</p>
          </div>
        )}

        <ol className="space-y-5">
          {activities.map((activity) => {
            const actor = [activity.actor_first_name, activity.actor_last_name]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={activity.id} className="relative pl-8">
                <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-300 ring-4 ring-emerald-400/10" />
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{activity.summary}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {humanize(activity.activity_type)}{actor ? ` · ${actor}` : ""}
                    </p>
                    {(activity.from_status || activity.to_status) && (
                      <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                        {humanize(activity.from_status)}
                        <ArrowRight className="h-3 w-3" />
                        {humanize(activity.to_status)}
                      </p>
                    )}
                    {activity.note && <p className="mt-2 text-sm leading-6 text-slate-500">{activity.note}</p>}
                  </div>
                  <time className="shrink-0 text-xs text-slate-600">{formatDateTime(activity.created_at)}</time>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
