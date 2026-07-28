import React from "react";

import KpiStrip from "../components/ocm/KpiStrip";
import JobsFeed from "../components/ocm/JobsFeed";
import AbujaOpsMap from "../components/ocm/AbujaOpsMap";
import AiCommandPanel from "../components/ocm/AiCommandPanel";

import { kpis } from "../data/kpis";
import { jobs } from "../data/jobs";
import { zones } from "../data/zones";
import { aiInsights } from "../data/aiInsights";

export default function OperationsCommandMode() {
  return (
    <section className="w-full min-h-screen bg-[#070A0F] text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-lg font-semibold">
            Novera — Operations Command Mode
          </h1>
          <p className="text-xs text-gray-400">
            Abuja live field operations system
          </p>
        </div>

        <KpiStrip kpis={kpis} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[420px]">

          <JobsFeed jobs={jobs} />

          <AbujaOpsMap zones={zones} />

          <AiCommandPanel aiInsights={aiInsights} />

        </div>

      </div>
    </section>
  );
}