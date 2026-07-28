import React from "react";
import { motion } from "framer-motion";

export default function AbujaOpsMap({ zones }) {
  const colors = {
    high: "bg-green-400",
    medium: "bg-blue-400",
    low: "bg-gray-400",
    risk: "bg-red-500",
  };

  return (
    <div className="relative bg-[#0E141C] border border-[#1B2633] rounded-xl p-4 h-full overflow-hidden">

      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(#1F2A36_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative mb-4">
        <p className="text-xs text-gray-400">Operations Command Grid</p>
        <h3 className="text-sm font-semibold text-white">
          Abuja Field Network
        </h3>
      </div>

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

      <motion.div
        className="absolute bottom-3 right-3 w-2 h-2 bg-green-400 rounded-full"
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}