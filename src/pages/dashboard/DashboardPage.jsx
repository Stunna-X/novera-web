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

import useAuth from "../../hooks/useAuth";

const metrics = [
  {
    label: "Active jobs",
    value: "0",
    note: "No jobs in progress",
    icon: BriefcaseBusiness,
  },
  {
    label: "Field crews",
    value: "0",
    note: "No crews assigned",
    icon: Users,
  },
  {
    label: "Equipment deployed",
    value: "0",
    note: "No equipment deployed",
    icon: Wrench,
  },
  {
    label: "Stock alerts",
    value: "0",
    note: "Inventory is clear",
    icon: PackageCheck,
  },
];

const quickLinks = [
  {
    to: "/jobs",
    label: "Create a job",
    description: "Start planning a new field operation.",
  },
  {
    to: "/teams",
    label: "Build your crew",
    description: "Add team members and define responsibilities.",
  },
  {
    to: "/equipment",
    label: "Register equipment",
    description: "Create a dependable operational asset register.",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.first_name || "there";

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/65 p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-52 w-52 translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-200">
              <MapPin className="h-3.5 w-3.5" />
              Abuja Operations
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Good to see you, {firstName}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              Your operational workspace is ready. Start adding jobs, teams,
              equipment, and inventory to bring the dashboard to life.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4" />
            New job
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-800 bg-slate-900/55 p-5 transition hover:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {value}
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-800 text-emerald-300">
                <Icon className="h-4.5 w-4.5" />
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-600">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/55">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-white">Active jobs</h2>
              <p className="mt-1 text-xs text-slate-500">
                Live execution across your field teams
              </p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid min-h-72 place-items-center px-6 py-12 text-center">
            <div className="max-w-sm">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-700 bg-slate-800/70 text-slate-400">
                <BriefcaseBusiness className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-sm font-semibold text-white">No active jobs yet</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your first scheduled or in-progress job will appear here.
              </p>
              <Link
                to="/jobs"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
              >
                Set up the jobs module
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-800 bg-slate-900/55 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
            Get operational
          </p>
          <h2 className="mt-3 text-lg font-semibold text-white">Build your workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Complete these foundations before running your first field job.
          </p>

          <div className="mt-6 space-y-3">
            {quickLinks.map((item, index) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.04]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-800 text-xs font-bold text-slate-300 group-hover:bg-emerald-400/10 group-hover:text-emerald-200">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-200 group-hover:text-white">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">
                    {item.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
