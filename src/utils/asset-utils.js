export const assetTypeOptions = [
  { value: "equipment", label: "Equipment" },
  { value: "vehicle", label: "Vehicle" },
  { value: "machine", label: "Machine" },
  { value: "tool", label: "Tool" },
  { value: "generator", label: "Generator" },
  { value: "pump", label: "Pump" },
  { value: "other", label: "Other" },
];

export const assetStatusOptions = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In use" },
  { value: "maintenance", label: "Maintenance" },
  { value: "unavailable", label: "Unavailable" },
  { value: "retired", label: "Retired" },
];

export const assetConditionOptions = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "damaged", label: "Damaged" },
];

export function humanizeAssetValue(value, fallback = "Not recorded") {
  if (!value) return fallback;

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatAssetDate(value, fallback = "Not recorded") {
  if (!value) return fallback;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export function formatAssetDateTime(value, fallback = "Not recorded") {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getServiceState(nextServiceDate) {
  if (!nextServiceDate) {
    return {
      key: "unknown",
      label: "No service date",
      className: "border-slate-700 bg-slate-800/60 text-slate-400",
    };
  }

  const due = new Date(`${nextServiceDate}T23:59:59`);
  const now = new Date();
  const remainingDays = Math.ceil((due.getTime() - now.getTime()) / 86400000);

  if (remainingDays < 0) {
    return {
      key: "overdue",
      label: "Service overdue",
      className: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    };
  }

  if (remainingDays <= 30) {
    return {
      key: "due_soon",
      label: `Service due in ${remainingDays} day${remainingDays === 1 ? "" : "s"}`,
      className: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    };
  }

  return {
    key: "scheduled",
    label: "Service scheduled",
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  };
}

export function optionalAssetText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
