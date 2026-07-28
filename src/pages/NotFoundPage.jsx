import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import NoveraLogo from "../components/brand/NoveraLogo";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-md text-center">
        <NoveraLogo className="justify-center" />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
          Error 404
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          This route is off the map.
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          The page may have moved, or the address may be incorrect.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
