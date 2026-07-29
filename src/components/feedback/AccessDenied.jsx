import { ShieldX } from "lucide-react";

export default function AccessDenied({ title = "Access restricted", description }) {
  return (
    <section className="grid min-h-[420px] place-items-center rounded-3xl border border-slate-800 bg-slate-900/55 px-6 py-16 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-200">
          <ShieldX className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          {description || "Your current role does not include permission to use this area."}
        </p>
      </div>
    </section>
  );
}
