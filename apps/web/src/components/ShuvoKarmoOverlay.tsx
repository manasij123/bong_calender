import { useMemo } from "react";
import {
  DayCell,
  ShuvoKarmoResult,
  dateKey,
  getShuvoKarmoForDates,
  toBengaliNumber,
  ENGLISH_MONTH_NAMES,
  BENGALI_MONTH_NAMES,
  PanchangSystem,
  GeoLocation,
} from "@bong/panjika-core";

interface ShuvoKarmoOverlayProps {
  open: boolean;
  onClose: () => void;
  mode: "bn" | "en";
  cells: DayCell[];
  loc: GeoLocation;
  system: PanchangSystem;
}

const SECTIONS: { key: keyof ShuvoKarmoResult; titleBn: string; titleEn: string; emoji: string }[] = [
  { key: "bibaha", titleBn: "বিবাহ", titleEn: "Marriage", emoji: "💍" },
  { key: "annaprashan", titleBn: "অন্নপ্রাশন", titleEn: "Annaprashan", emoji: "🍚" },
  { key: "grihaPravesh", titleBn: "গৃহপ্রবেশ", titleEn: "Griha Pravesh", emoji: "🏠" },
];

function dateLabel(cell: DayCell, mode: "bn" | "en"): string {
  if (mode === "bn") {
    return `${toBengaliNumber(cell.date.day)} ${ENGLISH_MONTH_NAMES[cell.date.month - 1]}, ${cell.info.bengali.weekdayName}`;
  }
  return `${cell.date.day} ${ENGLISH_MONTH_NAMES[cell.date.month - 1]}, ${cell.info.bengali.weekdayName}`;
}

function bengaliDateSub(cell: DayCell): string {
  return `${BENGALI_MONTH_NAMES[cell.info.bengali.monthIndex]} ${toBengaliNumber(cell.info.bengali.day)}`;
}

export default function ShuvoKarmoOverlay({ open, onClose, mode, cells, loc, system }: ShuvoKarmoOverlayProps) {
  const result = useMemo(() => {
    if (!open || cells.length === 0) return new Map<string, ShuvoKarmoResult>();
    return getShuvoKarmoForDates(cells.map((c) => c.date), loc, system);
  }, [open, cells, loc, system]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-16 sm:pt-20" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-[color:var(--border)] px-4 py-3 shrink-0">
          <h2 className="text-sm font-bold bn">শুভ কাজের দিন</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-[color:var(--text-muted)] text-xl leading-none px-1"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {SECTIONS.map((section) => {
            const matches = cells.filter((c) => result.get(dateKey(c.date))?.[section.key]);
            return (
              <div key={section.key} className="border-b border-[color:var(--border)] last:border-0">
                <div className="px-4 py-2 bg-[color:var(--bg-soft)] flex items-center gap-2">
                  <span aria-hidden>{section.emoji}</span>
                  <span className="text-xs font-semibold bn">{mode === "bn" ? section.titleBn : section.titleEn}</span>
                </div>
                {matches.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-[color:var(--text-muted)] bn">
                    এই মাসে কোনও উপযুক্ত দিন পাওয়া যায়নি।
                  </p>
                ) : (
                  <div className="divide-y divide-[color:var(--border)]">
                    {matches.map((c) => (
                      <div key={dateKey(c.date)} className="px-4 py-2 flex items-center justify-between gap-3">
                        <span className="text-sm bn">{dateLabel(c, mode)}</span>
                        <span className="text-xs text-[color:var(--text-muted)] bn shrink-0">{bengaliDateSub(c)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="px-4 py-2.5 text-[10px] text-[color:var(--text-muted)] leading-relaxed border-t border-[color:var(--border)] bn shrink-0">
          তিথি, নক্ষত্র, বার ও চতুর্মাস বিচার করে সাধারণ শুভত্ব দেখানো হয়েছে। এটি সম্পূর্ণ মুহূর্ত গণনা নয় (গুরু/শুক্র তারা
          অস্ত বা লগ্ন বিচার করা হয়নি) — গুরুত্বপূর্ণ অনুষ্ঠানের জন্য পুরোহিতের পরামর্শ নেওয়া উচিত।
        </p>
      </div>
    </div>
  );
}
