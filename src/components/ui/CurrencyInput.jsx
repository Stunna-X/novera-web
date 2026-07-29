import { useId, useMemo } from "react";

import { cn } from "../../utils/cn";
import {
  getCurrencySymbol,
  normalizeCurrencyCode,
} from "../../utils/currency";

function normalizeMoneyInput(value) {
  const input = String(value ?? "").replace(/,/g, "").trim();
  if (!input) return "";

  const cleaned = input.replace(/[^\d.]/g, "");
  const decimalIndex = cleaned.indexOf(".");
  const hasDecimal = decimalIndex !== -1;

  let whole = hasDecimal ? cleaned.slice(0, decimalIndex) : cleaned;
  const decimal = hasDecimal
    ? cleaned.slice(decimalIndex + 1).replace(/\./g, "").slice(0, 2)
    : "";

  whole = whole.replace(/^0+(?=\d)/, "");

  if (!whole && hasDecimal) whole = "0";
  if (!whole && !hasDecimal) return "";

  return hasDecimal ? `${whole}.${decimal}` : whole;
}

function formatMoneyInput(value) {
  const normalized = String(value ?? "");
  if (!normalized) return "";

  const hasDecimal = normalized.includes(".");
  const [whole = "0", decimal = ""] = normalized.split(".");
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return hasDecimal ? `${formattedWhole}.${decimal}` : formattedWhole;
}

export default function CurrencyInput({
  id,
  label,
  currencyCode = "NGN",
  value,
  onChange,
  error,
  hint = "Commas are added automatically.",
  className,
  inputClassName,
  required = false,
  disabled = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = `${inputId}-help`;
  const normalizedCurrency = normalizeCurrencyCode(currencyCode);
  const symbol = useMemo(
    () => getCurrencySymbol(normalizedCurrency),
    [normalizedCurrency],
  );

  function handleChange(event) {
    onChange?.(normalizeMoneyInput(event.target.value));
  }

  return (
    <label htmlFor={inputId} className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-200">
        {label} ({normalizedCurrency})
        {required && <span className="text-emerald-300">*</span>}
      </span>

      <span
        className={cn(
          "flex h-12 w-full overflow-hidden rounded-xl border bg-slate-950/60 transition focus-within:ring-4",
          error
            ? "border-rose-400/60 focus-within:border-rose-300 focus-within:ring-rose-400/10"
            : "border-slate-700/80 focus-within:border-emerald-400/70 focus-within:ring-emerald-400/10",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span className="flex min-w-12 items-center justify-center border-r border-slate-700/80 bg-slate-900/70 px-3 text-sm font-semibold text-emerald-300">
          {symbol}
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? helpId : undefined}
          value={formatMoneyInput(value)}
          onChange={handleChange}
          placeholder="0.00"
          className={cn(
            "min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-slate-600",
            inputClassName,
          )}
          {...props}
        />
      </span>

      {(error || hint) && (
        <span
          id={helpId}
          className={cn(
            "mt-2 block text-xs",
            error ? "text-rose-300" : "text-slate-500",
          )}
        >
          {error || hint}
        </span>
      )}
    </label>
  );
}
