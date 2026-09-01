import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useId, useState } from "react";

import { cn } from "../../utils/cn";

const TextField = forwardRef(function TextField(
  {
    id,
    label,
    error,
    hint,
    className,
    inputClassName,
    required,
    type = "text",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helpId = `${inputId}-help`;
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <label htmlFor={inputId} className={cn("block", className)}>
      <span className="mb-2 flex items-center gap-1 text-sm font-medium text-slate-200">
        {label}
        {required && <span className="text-emerald-300">*</span>}
      </span>

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? helpId : undefined}
          className={cn(
            "h-12 w-full rounded-xl border bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4",
            isPasswordField && "pr-12",
            error
              ? "border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/10"
              : "border-slate-700/80 focus:border-emerald-400/70 focus:ring-emerald-400/10",
            inputClassName,
          )}
          {...props}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            onMouseDown={(event) => event.preventDefault()}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500 transition hover:text-slate-200 focus:outline-none focus-visible:text-emerald-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

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

export default TextField;