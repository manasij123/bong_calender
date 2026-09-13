import { useEffect, ReactNode } from "react";

interface MobileSlideDrawerProps {
  open: boolean;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
}

/**
 * Generic full-height panel that slides in from the right on phone-width
 * screens (hidden entirely at lg+, where content lives inline/sidebar
 * instead). Used both for the single-day detail view and the month agenda
 * list, so the calendar grid itself is the only thing on the mobile main
 * screen.
 */
export default function MobileSlideDrawer({ open, onClose, closeLabel, children }: MobileSlideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`lg:hidden fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        className={`absolute inset-0 bg-black/55 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 right-0 w-[90%] max-w-sm overflow-y-auto bg-[color:var(--bg)] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-3 flex flex-col gap-3">
          <button
            onClick={onClose}
            className="self-start flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-4 py-3 text-sm font-semibold"
          >
            <span aria-hidden>←</span>
            <span className="bn">{closeLabel}</span>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
