import { forwardRef, useId } from "react";

import { cn } from "../../utils/cn";

const TextAreaField = forwardRef(function TextAreaField(
  {
    id,
    label,
    error,
    hint,
    className,
    textAreaClassName,
    required,
    rows = 4,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = `${inputId}-help`;

  return (
    <label htmlFor={inputId} className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-emerald-300">*</span>}
      </span>
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? helpId : undefined}
        className={cn(
          "w-full resize-y rounded-xl border bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4",
          error
            ? "border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10"
            : "border-slate-700/80 focus:border-emerald-400/70 focus:ring-emerald-400/10",
          textAreaClassName,
        )}
        {...props}
      />
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

export default TextAreaField;
