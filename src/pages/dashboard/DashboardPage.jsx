import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  Plus,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router";

import BreakdownCard from "../../components/dashboard/BreakdownCard";
import DashboardMetricCard from "../../components/dashboard/DashboardMetricCard";
import AccessDenied from "../../components/feedback/AccessDenied";
import Alert from "../../components/ui/Alert";
import WorkspaceEmptyState from "../../components/workspace/WorkspaceEmptyState";
import useAuth from "../../hooks/useAuth";
import useDashboardAnalytics from "../../hooks/useDashboardAnalytics";
import useWorkspace from "../../hooks/useWorkspace";
import { formatCurrency } from "../../utils/currency";
import {
  formatDateTime,
  getJobStatusLabel,
  humanize,
} from "../../utils/job-utils";

function formatGeneratedAt(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function CurrencyRows({ items = [] }) {
  if (items.length === 0) return <span className="text-slate-600">—</span>;

  return (
    <span className="flex flex-wrap justify-end gap-x-3 gap-y-1">
      {items.map((item) => (
        <span key={item.currency} className="whitespace-nowrap text-white">
          {formatCurrency(item.amount, item.currency)}
        </span>
      ))}
    </span>
  );
}

function CommercialRow({ label, items }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-800/80 py-4 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold">
        <CurrencyRows items={items} />
      </span>
    </div>
  );
}

function JobList({ title, jobs = [], emptyLabel }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/55">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="grid min-h-56 place-items-center px-6 py-10 text-center">
          <div>
            <BriefcaseBusiness className="mx-auto h-7 w-7 text-slate-700" />
            <p className="mt-4 text-sm text-slate-500">{emptyLabel}</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              aria-label={`Open ${job.title}`}
              className="group flex cursor-pointer flex-col gap-3 px-5 py-4 transition hover:bg-slate-800/35 focus-visible:bg-slate-800/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-300">
                  {job.work_order_number}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white transition group-hover:text-emerald-100">
                  {job.title}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
                <span>{formatDateTime(job.scheduled_start || job.actual_end)}</span>
                <span className="rounded-full border border-slate-700 px-2.5 py-1 text-slate-300">
                  {getJobStatusLabel(job.status)}
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function WorkloadPanel({ team }) {
  const workforce = team?.workforce || [];
  const assets = team?.assets || [];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">Capacity and workload</h2>
      <div className="mt-6 grid gap-7 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-600">Team</span>
            <Link to="/teams" className="text-emerald-300 hover:text-emerald-200">Open teams</Link>
          </div>
          <div className="space-y-2">
            {workforce.slice(0, 5).map((member) => (
              <div key={member.workforce_profile_id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/55 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{member.first_name} {member.last_name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-600">{member.job_title || member.role_name}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-300">{member.open_assignment_count} open</span>
              </div>
            ))}
            {workforce.length === 0 && <p className="py-8 text-center text-sm text-slate-600">No team workload yet</p>}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-slate-600">Equipment</span>
            <Link to="/equipment" className="text-emerald-300 hover:text-emerald-200">Open equipment</Link>
          </div>
          <div className="space-y-2">
            {assets.slice(0, 5).map((asset) => (
              <div key={asset.asset_id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/55 px-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{asset.name}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-600">{asset.asset_code} · {humanize(asset.condition)}</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-300">{asset.open_assignment_count} open</span>
              </div>
            ))}
            {assets.length === 0 && <p className="py-8 text-center text-sm text-slate-600">No equipment workload yet</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    activeOrganization,
    activeOrganizationId,
    hasPermission,
    isLoading: workspaceLoading,
  } = useWorkspace();
  const canReadDashboard = hasPermission("dashboard.read");
  const canCreateJobs = hasPermission("work_orders.create");
  const { data, errors, loading, refresh } = useDashboardAnalytics(
    activeOrganizationId,
    { enabled: Boolean(activeOrganizationId && canReadDashboard) },
  );
  const firstName = user?.first_name || "there";

  if (workspaceLoading) {
    return <div className="h-[520px] animate-pulse rounded-3xl bg-slate-900/60" />;
  }

  if (!activeOrganizationId) return <WorkspaceEmptyState returnTo="/dashboard" />;

  if (!canReadDashboard) {
    return (
      <AccessDenied
        title="Dashboard access restricted"
        description="Your current role does not include dashboard analytics access."
      />
    );
  }

  const { overview, workOrders, finance, team } = data;
  const generatedAt = formatGeneratedAt(
    overview?.generated_at || workOrders?.generated_at || team?.generated_at,
  );
  const metrics = [
    {
      label: "Active jobs",
      value: overview?.active_work_orders ?? 0,
      detail: "Open operational work",
      icon: BriefcaseBusiness,
      tone: "emerald",
    },
    {
      label: "Scheduled",
      value: overview?.scheduled_work_orders ?? 0,
      detail: "Jobs ready on the calendar",
      icon: CalendarDays,
      tone: "sky",
          to: "/jobs?status=scheduled",
    },
    {
      label: "In progress",
      value: overview?.in_progress_work_orders ?? 0,
      detail: "Live field execution",
      icon: Clock3,
      tone: "violet",
    },
    {
      label: "Overdue",
      value: overview?.overdue_scheduled_work_orders ?? 0,
      detail: "Scheduled jobs needing attention",
      icon: AlertTriangle,
      tone: (overview?.overdue_scheduled_work_orders || 0) > 0 ? "rose" : "slate",
    },
    {
      label: "Available crew",
      value: `${team?.available_workforce_count ?? 0}/${team?.active_workforce_count ?? 0}`,
      detail: "Available active team members",
      icon: Users,
      tone: "emerald",
    },
    {
      label: "Available equipment",
      value: `${team?.available_asset_count ?? 0}/${team?.active_asset_count ?? 0}`,
      detail: "Available active assets",
      icon: Wrench,
      tone: "amber",
    },
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
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Good to see you, {firstName}.
            </h1>
            {generatedAt && <p className="mt-3 text-xs text-slate-600">Updated {generatedAt}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            {canCreateJobs && (
              <Link to="/jobs/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                <Plus className="h-4 w-4" /> New job
              </Link>
            )}
          </div>
        </div>
      </section>

      {errors.length > 0 && (
        <Alert variant="error">
          {errors.length === 4
            ? "Dashboard analytics could not be loaded."
            : `${errors.length} dashboard section${errors.length === 1 ? "" : "s"} could not be loaded.`}
          <button type="button" onClick={refresh} className="ml-2 font-semibold underline underline-offset-2">Try again</button>
        </Alert>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <DashboardMetricCard key={metric.label} {...metric} loading={loading && !overview && !team} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <BreakdownCard title="Jobs by status" items={workOrders?.status_counts} tone="emerald" />
        <BreakdownCard title="Jobs by priority" items={workOrders?.priority_counts} tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <JobList title="Upcoming jobs" jobs={workOrders?.upcoming_work_orders} emptyLabel="No upcoming jobs" />

        <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><Banknote className="h-4.5 w-4.5" /></span>
            <h2 className="text-base font-semibold text-white">Commercial position</h2>
          </div>
          <div className="mt-4">
            <CommercialRow label="Total invoiced" items={finance?.total_invoiced} />
            <CommercialRow label="Total paid" items={finance?.total_paid} />
            <CommercialRow label="Outstanding" items={finance?.total_outstanding} />
            <CommercialRow label="Accepted quotes" items={finance?.accepted_quote_value} />
            <CommercialRow label="Converted quotes" items={finance?.converted_quote_value} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-800 pt-5 text-center">
            <div><p className="text-xl font-semibold text-white">{overview?.open_quotes ?? 0}</p><p className="mt-1 text-[11px] text-slate-600">Open quotes</p></div>
            <div><p className="text-xl font-semibold text-white">{overview?.approved_closeouts ?? 0}</p><p className="mt-1 text-[11px] text-slate-600">Approved closeouts</p></div>
            <div><p className="text-xl font-semibold text-white">{overview?.invoice_ready_closeouts ?? 0}</p><p className="mt-1 text-[11px] text-slate-600">Invoice ready</p></div>
          </div>
        </section>
      </section>

      <WorkloadPanel team={team} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <JobList title="Recently completed" jobs={workOrders?.recently_completed_work_orders} emptyLabel="No completed jobs yet" />
        <section className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
          <h2 className="text-base font-semibold text-white">Closeouts and invoices</h2>
          <div className="mt-6 space-y-3">
            {[
              ["Submitted closeouts", overview?.submitted_closeouts, ClipboardCheck],
              ["Approved closeouts", overview?.approved_closeouts, CheckCircle2],
              ["Draft invoices", overview?.draft_invoices, Banknote],
              ["Issued invoices", overview?.issued_invoices, ArrowUpRight],
              ["Partially paid", overview?.partially_paid_invoices, Clock3],
              ["Paid invoices", overview?.paid_invoices, CheckCircle2],
            ].map(([label, value, Icon]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-950/55 px-4 py-3">
                <span className="flex items-center gap-3 text-sm text-slate-400"><Icon className="h-4 w-4 text-slate-600" /> {label}</span>
                <span className="text-sm font-semibold text-white">{value ?? 0}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
