import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDate, PanchangSystem } from "@bong/panjika-core";
import { buildFestivalSearchIndex, searchFestivals } from "../lib/search";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  mode: "bn" | "en";
  system: PanchangSystem;
  onSelectDate: (date: CalendarDate) => void;
}

export default function SearchOverlay({ open, onClose, mode, system, onSelectDate }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => buildFestivalSearchIndex(new Date().getFullYear(), system), [system]);
  const results = useMemo(() => searchFestivals(query, index, mode, system), [query, index, mode, system]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handlePick(date: CalendarDate) {
    onSelectDate(date);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 sm:pt-24" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[color:var(--border)] px-3 py-2.5">
          <span aria-hidden className="text-lg shrink-0">
            🔍
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "bn" ? "তারিখ বা উৎসবের নাম লিখুন..." : "Search a date or festival name..."}
            className="min-w-0 flex-1 bg-transparent outline-none text-sm bn"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="shrink-0 text-[color:var(--text-muted)] text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim() && results.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-[color:var(--text-muted)] bn">
              {mode === "bn" ? "কিছু খুঁজে পাওয়া যায়নি" : "No matches found"}
            </div>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.kind}-${r.date.year}-${r.date.month}-${r.date.day}-${i}`}
              onClick={() => handlePick(r.date)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[color:var(--bg-soft)] border-b border-[color:var(--border)] last:border-0"
            >
              <span className="text-sm font-semibold bn truncate">{r.primary}</span>
              <span className="text-xs text-[color:var(--text-muted)] shrink-0 bn">{r.secondary}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
