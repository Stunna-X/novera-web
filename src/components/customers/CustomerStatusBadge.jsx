export default function CustomerStatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-slate-600 bg-slate-800 text-slate-400"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
