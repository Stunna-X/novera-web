import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, title, description, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/40 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description && (
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Close dialog"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </section>
    </div>,
    document.body,
  );
}
