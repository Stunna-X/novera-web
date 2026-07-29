import { ArrowUpRight, CalendarClock, Users, Wrench } from "lucide-react";
import { Link } from "react-router";

import JobPriorityBadge from "./JobPriorityBadge";
import JobStatusBadge from "./JobStatusBadge";
import { formatDateTime } from "../../utils/job-utils";

function ResourceCounts({ job }) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1">
        <Users className="h-3.5 w-3.5" />
        {job.workforce_profile_ids?.length || 0}
      </span>
      <span className="inline-flex items-center gap-1">
        <Wrench className="h-3.5 w-3.5" />
        {job.asset_ids?.length || 0}
      </span>
    </div>
  );
}

export default function JobsTable({ jobs }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/55">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            <tr>
              <th className="px-5 py-4">Job</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Schedule</th>
              <th className="px-5 py-4">Resources</th>
              <th className="w-16 px-5 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {jobs.map((job) => (
              <tr key={job.id} className="transition hover:bg-slate-800/25">
                <td className="px-5 py-4">
                  <Link to={`/jobs/${job.id}`} className="group block">
                    <span className="block text-xs font-semibold text-emerald-300">
                      {job.work_order_number}
                    </span>
                    <span className="mt-1 block max-w-md truncate text-sm font-semibold text-white group-hover:text-emerald-100">
                      {job.title}
                    </span>
                    <span className="mt-1 block text-xs text-slate-600">
                      {job.job_type || "General field work"}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-4"><JobStatusBadge status={job.status} /></td>
                <td className="px-5 py-4"><JobPriorityBadge priority={job.priority} /></td>
                <td className="px-5 py-4 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-slate-600" />
                    {formatDateTime(job.scheduled_start)}
                  </span>
                </td>
                <td className="px-5 py-4"><ResourceCounts job={job} /></td>
                <td className="px-5 py-4">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-emerald-300"
                    aria-label={`Open ${job.title}`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-800 md:hidden">
        {jobs.map((job) => (
          <Link
            key={job.id}
            to={`/jobs/${job.id}`}
            className="block p-4 transition hover:bg-slate-800/25"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-300">{job.work_order_number}</p>
                <h2 className="mt-1 truncate text-sm font-semibold text-white">{job.title}</h2>
              </div>
              <JobStatusBadge status={job.status} />
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">{formatDateTime(job.scheduled_start)}</span>
              <ResourceCounts job={job} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
