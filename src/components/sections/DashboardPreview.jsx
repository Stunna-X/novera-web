import React from "react";
import { motion } from "framer-motion";

/* =========================
   DATA LAYER
========================= */

const kpis = [
  { label: "Active Jobs", value: "12" },
  { label: "Completed Today", value: "8" },
  { label: "Teams On Field", value: "5" },
  { label: "Revenue", value: "₦1.4M" },
  { label: "Utilization", value: "76%" },
];

const jobs = [
  { name: "Borehole Drilling - Maitama", status: "67%", type: "in-progress" },
  { name: "Solar Installation - Wuse 2", status: "Completed", type: "completed" },
  { name: "Generator Service - Gwarinpa", status: "45%", type: "in-progress" },
  { name: "Pipe Delivery - Kubwa", status: "Delayed", type: "risk" },
];

const aiInsights = [
  "2 jobs at risk due to crew overlap in Wuse/Gwarinpa",
  "Recommend dispatching Team B to Maitama immediately",
  "Equipment idle in Asokoro warehouse for 6h",
];

const zones = [
  { name: "Maitama", level: "high" },
  { name: "Wuse 2", level: "medium" },
  { name: "Gwarinpa", level: "high" },
  { name: "Asokoro", level: "low" },
  { name: "Kubwa", level: "risk" },
  { name: "Lugbe", level: "medium" },
];

/* =========================
   UI COMPONENTS
========================= */

function StatusBadge({ type }) {
  const styles = {
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    delayed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    risk: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-md border ${styles[type]}`}>
      {type}
    </span>
  );
}

/* =========================
   ABUJA OPS MAP (OCM CORE)
========================= */

function AbujaOpsMap() {
  const colors = {
    high: "bg-green-400",
    medium: "bg-blue-400",
    low: "bg-gray-400",
    risk: "bg-red-500",
  };

  return (
    <div className="relative bg-[#0E141C] border border-[#1B2633] rounded-xl p-4 h-full overflow-hidden">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(#1F2A36_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      {/* HEADER */}
      <div className="relative mb-4">
        <p className="text-xs text-gray-400">Operations Command Grid</p>
        <h3 className="text-sm font-semibold text-white">
          Abuja Field Network
        </h3>
      </div>

      {/* ZONES */}
      <div className="relative grid grid-cols-2 gap-3">
        {zones.map((z, i) => (
          <motion.div
            key={z.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              className={`w-2.5 h-2.5 rounded-full ${colors[z.level]}`}
            />
            <span className="text-xs text-gray-300">{z.name}</span>
          </motion.div>
        ))}
      </div>

      {/* LIVE PULSE */}
      <motion.div
        className="absolute bottom-3 right-3 w-2 h-2 bg-green-400 rounded-full"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

/* =========================
   MAIN OCM DASHBOARD
========================= */

export default function OperationsCommandMode() {
  return (
    <section className="w-full min-h-screen bg-[#070A0F] text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* TITLE BAR */}
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-wide">
            Novera — Operations Command Mode
          </h1>
          <p className="text-xs text-gray-400">
            Live field operations overview • Abuja Network
          </p>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#121821] border border-[#1F2A36] rounded-xl p-4"
            >
              <p className="text-xs text-gray-400">{kpi.label}</p>
              <p className="text-lg font-semibold mt-1">{kpi.value}</p>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[420px]">

          {/* LIVE JOBS */}
          <div className="bg-[#121821] border border-[#1F2A36] rounded-xl p-5 overflow-auto">
            <h2 className="text-sm font-semibold text-gray-300 mb-4">
              Live Operations
            </h2>

            <div className="space-y-3">
              {jobs.map((job, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 bg-[#0E141C] border border-[#1B2633] rounded-lg"
                >
                  <div className="flex justify-between">
                    <p className="text-sm">{job.name}</p>
                    <StatusBadge type={job.type} />
                  </div>

                  {job.type === "in-progress" && (
                    <div className="mt-2 h-1 bg-[#1B2633] rounded overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500/70"
                        initial={{ width: "0%" }}
                        animate={{ width: job.status }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    Status: {job.status}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* COMMAND MAP */}
          <div>
            <AbujaOpsMap />
          </div>

          {/* AI COMMAND LAYER */}
          <div className="bg-[#121821] border border-[#1F2A36] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-gray-300">
                AI Command Layer
              </h2>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>

            <div className="space-y-3">
              {aiInsights.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 bg-[#0E141C] border border-[#1B2633] rounded-lg text-sm text-gray-300"
                >
                  {msg}
                </motion.div>
              ))}
            </div>

            {/* COMMAND INPUT (future-ready UI) */}
            <div className="mt-4 border border-[#1B2633] rounded-lg p-2 text-xs text-gray-500">
              Ask AI: “Reassign teams in Wuse”
            </div>
          </div>
        </div>

        {/* FOOTER STATUS BAR */}
        <div className="mt-6 flex justify-between text-xs text-gray-500">
          <p>System Status: Operational</p>
          <p>Abuja Network Sync: Live</p>
        </div>

      </div>
    </section>
  );
}