export const jobStatusOptions = Object.freeze([
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_progress", label: "In progress" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]);


export const allowedJobStatusTransitions = Object.freeze({
  draft: ["scheduled", "cancelled"],
  scheduled: ["dispatched", "in_progress", "on_hold", "cancelled"],
  dispatched: ["in_progress", "on_hold", "cancelled"],
  in_progress: ["on_hold", "completed", "cancelled"],
  on_hold: ["scheduled", "dispatched", "in_progress", "cancelled"],
  completed: [],
  cancelled: [],
});

export const jobPriorityOptions = Object.freeze([
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]);

export function getJobStatusLabel(value) {
  return jobStatusOptions.find((option) => option.value === value)?.label || humanize(value);
}

export function getJobPriorityLabel(value) {
  return jobPriorityOptions.find((option) => option.value === value)?.label || humanize(value);
}

export function humanize(value) {
  if (!value) return "—";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDateTime(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function toDateTimeLocalValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toApiDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function formatDecimal(value) {
  if (value === null || value === undefined || value === "") return "—";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value);
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(numericValue);
}

export function truncateId(value) {
  if (!value) return "—";
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}
