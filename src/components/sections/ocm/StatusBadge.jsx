import React from "react";

export default function StatusBadge({ type }) {
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