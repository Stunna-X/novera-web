import React from "react";
import { motion } from "framer-motion";

export default function AiCommandPanel({ aiInsights }) {
  return (
    <div className="bg-[#121821] border border-[#1F2A36] rounded-xl p-5 h-full">
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

      <div className="mt-4 border border-[#1B2633] rounded-lg p-2 text-xs text-gray-500">
        Ask AI: “Reassign teams in Wuse”
      </div>
    </div>
  );
}