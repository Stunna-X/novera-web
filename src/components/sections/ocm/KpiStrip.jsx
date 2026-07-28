import React from "react";

export default function KpiStrip({ kpis }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-[#121821] border border-[#1F2A36] rounded-xl p-4"
        >
          <p className="text-xs text-gray-400">{kpi.label}</p>
          <p className="text-lg font-semibold mt-1">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}