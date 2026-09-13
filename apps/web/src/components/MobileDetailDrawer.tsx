import { useEffect } from "react";
import { DayDetail } from "@bong/panjika-core";
import DayDetailPanel from "./DayDetailPanel";

interface MobileDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  detail: DayDetail;
  mode: "bn" | "en";
}

/**
 * Full-height panel that slides in from the right on phone-width screens
 * (hidden entirely at lg+, where the detail panel is a sticky sidebar
 * instead). Keeping the detail view out of the normal mobile document flow
 * leaves the calendar grid free to grow taller, which is what actually
 * makes the festival artwork in each cell readable.
 */
export default function MobileDetailDrawer({ open, onClose, detail, mode }: MobileDetailDrawerProps) {
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
            className="self-start flex items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-3 py-1.5 text-sm font-semibold"
          >
            <span aria-hidden>←</span>
            <span className="bn">বন্ধ করুন</span>
          </button>
          <DayDetailPanel detail={detail} mode={mode} />
        </div>
      </div>
    </div>
  );
}
