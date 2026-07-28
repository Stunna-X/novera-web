import { forwardRef } from "react";

import { cn } from "../../utils/cn";

const variants = {
  primary:
    "bg-emerald-400 text-slate-950 hover:bg-emerald-300 focus-visible:ring-emerald-300/50",
  secondary:
    "border border-slate-700 bg-slate-900/80 text-slate-100 hover:border-slate-600 hover:bg-slate-800",
  ghost:
    "text-slate-300 hover:bg-slate-800/80 hover:text-white focus-visible:ring-slate-600",
  danger:
    "border border-rose-400/20 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15 focus-visible:ring-rose-400/30",
};

const sizes = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-11 rounded-xl px-4 text-sm",
  lg: "h-12 rounded-xl px-5 text-sm",
};

const Button = forwardRef(function Button(
  {
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});

export default Button;
