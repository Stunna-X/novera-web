import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  PackageCheck,
  Plus,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useAuth from "../../hooks/useAuth";
import useWorkOrderDashboard from "../../hooks/useWorkOrderDashboard";
import useWorkspace from "../../hooks/useWorkspace";
import { formatDateTime } from "../../utils/job-utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeOrganization, activeOrganizationId, hasPermission, isLoading } = useWorkspace();
  const canReadJobs = hasPermission("work_orders.read");
  const canCreateJobs = hasPermission("work_orders.create");
  const { data, loading } = useWorkOrderDashboard(activeOrganizationId, {
    enabled: Boolean(activeOrganizationId && canReadJobs),
  });
  const firstName = user?.first_name || "there";

  if (isLoading) return <div className="h-[520px] animate-pulse rounded-3xl bg-slate-900/60" />;
  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo="/dashboard" />;

  const counts = Object.fromEntries((data?.status_counts || []).map((item) => [item.label, item.count]));
  const activeJobs = ["scheduled", "dispatched", "in_progress", "on_hold"].reduce((total, status) => total + (counts[status] || 0), 0);
  const upcoming = data?.upcoming_work_orders || [];
  const metrics = [
    { label: "Active jobs", value: loading ? "…" : String(activeJobs), note: "Scheduled through on-hold work", icon: BriefcaseBusiness },
    { label: "In progress", value: loading ? "…" : String(counts.in_progress || 0), note: "Live field execution", icon: Users },
    { label: "Completed", value: loading ? "…" : String(counts.completed || 0), note: "Finished operational work", icon: Wrench },
    { label: "On hold", value: loading ? "…" : String(counts.on_hold || 0), note: "Jobs requiring attention", icon: PackageCheck },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-52 w-52 translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-200">
              <MapPin className="h-3.5 w-3.5" /> {activeOrganization?.name}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Good to see you, {firstName}.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Your dashboard now reads live work-order analytics from the active Novera organisation.</p>
          </div>
          {canCreateJobs && (
            <Link to="/jobs/new" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              <Plus className="h-4 w-4" /> New job
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 transition hover:border-slate-700">
            <div className="flex items-start justify-between">
              <div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p></div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-emerald-300"><Icon className="h-4.5 w-4.5" /></span>
            </div>
            <p className="mt-4 text-xs text-slate-600">{note}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/55">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
          <div><h2 className="text-base font-semibold text-white">Upcoming jobs</h2><p className="mt-1 text-xs text-slate-500">Scheduled operational work from the backend dashboard endpoint</p></div>
          <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center"><div><BriefcaseBusiness className="mx-auto h-7 w-7 text-slate-600" /><p className="mt-4 text-sm font-semibold text-white">No upcoming jobs</p><p className="mt-2 text-sm text-slate-500">Scheduled work will appear here.</p></div></div>
        ) : (
          <div className="divide-y divide-slate-800">
            {upcoming.map((job) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-800/20 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0"><p className="text-xs font-semibold text-emerald-300">{job.work_order_number}</p><p className="mt-1 truncate text-sm font-semibold text-white">{job.title}</p></div>
                <div className="flex items-center gap-3"><span className="text-xs text-slate-500">{formatDateTime(job.scheduled_start)}</span><JobStatusBadge status={job.status} /></div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
