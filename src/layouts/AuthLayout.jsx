import { Activity, ShieldCheck, Workflow } from "lucide-react";
import { Outlet } from "react-router";

import NoveraLogo from "../components/brand/NoveraLogo";

const benefits = [
  {
    icon: Workflow,
    title: "Control every field job",
    description: "Keep jobs, crews, equipment, and materials moving together.",
  },
  {
    icon: Activity,
    title: "See operations clearly",
    description: "Turn live field activity into decisions your team can act on.",
  },
  {
    icon: ShieldCheck,
    title: "Built for accountable work",
    description: "Protect access and preserve a clear operational trail.",
  },
];

export default function AuthLayout() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(480px,0.9fr)]">
      <section className="relative hidden min-h-screen overflow-hidden border-r border-slate-800/80 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_36%),linear-gradient(145deg,rgba(15,23,42,0.2),rgba(2,6,23,0.9))]" />
        <div className="absolute -left-32 bottom-10 h-96 w-96 rounded-full border border-emerald-400/10" />
        <div className="absolute -left-20 bottom-24 h-72 w-72 rounded-full border border-emerald-400/10" />

        <div className="relative z-10">
          <NoveraLogo />
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Operations without blind spots
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            The operating system for serious field teams.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-slate-400">
            Novera brings planning, execution, assets, inventory, and accountability
            into one dependable workspace.
          </p>

          <div className="mt-10 grid gap-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/45 p-4 backdrop-blur"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-600">
          Novera · Field team first
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <NoveraLogo />
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
