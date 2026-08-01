export const INVENTORY_VIEWS = Object.freeze([
  { value: "stock", label: "Stock" },
  { value: "items", label: "Items" },
  { value: "locations", label: "Locations" },
  { value: "movements", label: "Movements" },
  { value: "low-stock", label: "Low stock" },
  { value: "reservations", label: "Reservations" },
]);

export const ITEM_TYPES = Object.freeze([
  { value: "material", label: "Material" },
  { value: "consumable", label: "Consumable" },
  { value: "spare_part", label: "Spare part" },
  { value: "supply", label: "Supply" },
  { value: "fuel", label: "Fuel" },
  { value: "other", label: "Other" },
]);

export const LOCATION_TYPES = Object.freeze([
  { value: "warehouse", label: "Warehouse" },
  { value: "store", label: "Store" },
  { value: "vehicle", label: "Vehicle" },
  { value: "job_site", label: "Job site" },
  { value: "technician", label: "Technician" },
  { value: "other", label: "Other" },
]);

export const MOVEMENT_LABELS = Object.freeze({
  opening_balance: "Opening balance",
  receipt: "Received",
  issue: "Issued",
  return: "Returned",
  adjustment_in: "Adjustment in",
  adjustment_out: "Adjustment out",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
});

export const RESERVATION_LABELS = Object.freeze({
  active: "Active",
  partially_consumed: "Partly used",
  consumed: "Consumed",
  released: "Released",
  cancelled: "Cancelled",
});

export function makeInventoryReference(prefix) {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${time}${random}`;
}

export function normalizeDecimalInput(value, { allowNegative = false } = {}) {
  const cleaned = String(value ?? "")
    .replace(/,/g, "")
    .replace(allowNegative ? /[^0-9.-]/g : /[^0-9.]/g, "");

  const sign = allowNegative && cleaned.startsWith("-") ? "-" : "";
  const unsigned = cleaned.replace(/-/g, "");
  const [whole = "", ...fractionParts] = unsigned.split(".");
  const fraction = fractionParts.join("").slice(0, 3);

  if (unsigned.includes(".")) return `${sign}${whole}.${fraction}`;
  return `${sign}${whole}`;
}

export function toApiDecimal(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).replace(/,/g, "");
  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? normalized : fallback;
}

export function formatQuantity(value, unit = "") {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 3,
  }).format(numeric);

  return unit ? `${formatted} ${unit}` : formatted;
}

export function getListItems(payload) {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.items) ? payload.items : [];
}

export function getJobLabel(job) {
  const number = job?.work_order_number || job?.job_number;
  const title = job?.title || "Untitled job";
  return number ? `${title} · ${number}` : title;
}

export function isOpenReservation(reservation) {
  return ["active", "partially_consumed"].includes(reservation?.status);
}
