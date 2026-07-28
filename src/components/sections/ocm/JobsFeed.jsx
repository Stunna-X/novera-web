import React from "react";
import StatusBadge from "./StatusBadge";

export default function JobsFeed({ jobs }) {
  return (
    <div className="bg-[#121821] border border-[#1F2A36] rounded-xl p-5 h-full overflow-auto">
      <h2 className="text-sm font-semibold text-gray-300 mb-4">
        Live Operations
      </h2>

      <div className="space-y-3">
        {jobs.map((job, i) => (
          <div
            key={i}
            className="p-3 bg-[#0E141C] border border-[#1B2633] rounded-lg"
          >
            <div className="flex justify-between">
              <p className="text-sm">{job.name}</p>
              <StatusBadge type={job.type} />
            </div>

            <p className="text-xs text-gray-400 mt-2">
              Status: {job.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}