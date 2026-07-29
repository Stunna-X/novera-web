import { forwardRef, useId } from "react";

import { cn } from "../../utils/cn";

const SelectField = forwardRef(function SelectField(
  {
    id,
    label,
    error,
    hint,
    className,
    selectClassName,
    required,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const helpId = `${selectId}-help`;

  return (
    <label htmlFor={selectId} className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-emerald-300">*</span>}
      </span>
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? helpId : undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-slate-950/60 px-4 text-sm text-white outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
          error
            ? "border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10"
            : "border-slate-700/80 focus:border-emerald-400/70 focus:ring-emerald-400/10",
          selectClassName,
        )}
        {...props}
      >
        {children}
      </select>
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
});

export default SelectField;
