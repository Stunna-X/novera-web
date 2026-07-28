import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "../../utils/cn";

const variants = {
  error: {
    icon: AlertCircle,
    className: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  },
  info: {
    icon: Info,
    className: "border-sky-400/20 bg-sky-400/10 text-sky-100",
  },
};

export default function Alert({ variant = "info", children, className }) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-6",
        config.className,
        className,
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
