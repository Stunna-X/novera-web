import { ArrowRight, Construction } from "lucide-react";

export default function ModulePage({ eyebrow, title, description }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/55">
      <div className="border-b border-slate-800 px-6 py-6 sm:px-8 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
          {description}
        </p>
      </div>

      <div className="grid min-h-[420px] place-items-center px-6 py-16 text-center">
        <div className="max-w-md">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300">
            <Construction className="h-7 w-7" />
          </span>
          <h2 className="mt-6 text-lg font-semibold text-white">
            {title} foundation is ready
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Routing, access protection, navigation, and the page shell are now in
            place. The next row connects the real {title.toLowerCase()} workflow.
          </p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
            Ready for domain implementation
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
}
