import { DayCell, dateKey, toBengaliNumber } from "@bong/panjika-core";
import FestivalIconGlyph, { IconKey } from "./festivalIcons";
import CyclingImage from "./CyclingImage";
import MarqueeText from "./MarqueeText";
import MultiEventBadge from "./MultiEventBadge";
import AnimatedValue from "./AnimatedValue";
import { CATEGORY_COLOR, TITHI_BADGE_COLOR, hexToRgbaVar, deepenColor } from "../lib/festivalColor";
import { FESTIVAL_IMAGES, TITHI_IMAGES } from "../lib/festivalImages";

const WEEKDAY_HEADERS_BN = ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"];
const WEEKDAY_HEADERS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const EN_MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

interface CalendarGridProps {
  mode: "bn" | "en";
  cells: DayCell[];
  selectedKey: string | null;
  todayKey: string;
  onSelect: (cell: DayCell) => void;
}

interface CellBadge {
  icon: IconKey;
  images?: string[];
  color: string;
  label: string;
}

function badgeFor(cell: DayCell, mode: "bn" | "en"): CellBadge | null {
  const event = cell.events[0];
  if (event) {
    return {
      icon: event.festival.icon,
      images: FESTIVAL_IMAGES[event.festival.id],
      color: CATEGORY_COLOR[event.festival.category],
      label: mode === "bn" ? event.festival.nameBn : event.festival.nameEn,
    };
  }
  const tithi = cell.info.panchang.tithi;
  if (tithi.index === 15) {
    return tithi.paksha === "shukla"
      ? { icon: "moon-full", color: TITHI_BADGE_COLOR.purnima, label: tithi.name }
      : { icon: "moon-new", images: TITHI_IMAGES.amavasya, color: TITHI_BADGE_COLOR.amavasya, label: tithi.name };
  }
  if (tithi.index === 11) {
    return { icon: "ekadashi", images: TITHI_IMAGES.ekadashi, color: TITHI_BADGE_COLOR.ekadashi, label: tithi.name };
  }
  return null;
}

export default function CalendarGrid({ mode, cells, selectedKey, todayKey, onSelect }: CalendarGridProps) {
  if (cells.length === 0) return null;
  const leading = cells[0].info.displayBengali.weekday;
  const trailing = (7 - ((leading + cells.length) % 7)) % 7;
  const headers = mode === "bn" ? WEEKDAY_HEADERS_BN : WEEKDAY_HEADERS_EN;

  return (
    <div className="-mx-3 sm:mx-0 rounded-none sm:rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/60 p-3 sm:p-4 shadow-glow">
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {headers.map((h, i) => (
          <div
            key={h}
            className={`text-center text-xs sm:text-sm font-bold py-2 bn ${
              i === 0 ? "text-[color:var(--today-ring)]" : "text-[color:var(--text-muted)]"
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: leading }).map((_, i) => (
          <div key={`lead-${i}`} />
        ))}

        {cells.map((cell) => {
          const key = dateKey(cell.date);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const isSunday = cell.info.displayBengali.weekday === 0;
          const primary = mode === "bn" ? toBengaliNumber(cell.info.displayBengali.day) : String(cell.date.day);
          const isEnglishMonthStart = cell.date.day === 1;
          const secondary =
            mode === "bn"
              ? isEnglishMonthStart
                ? EN_MONTH_SHORT[cell.date.month - 1]
                : String(cell.date.day)
              : toBengaliNumber(cell.info.displayBengali.day);
          const hasMultipleEvents = cell.events.length >= 2;
          const badge = hasMultipleEvents ? null : badgeFor(cell, mode);
          const cellTintColor = hasMultipleEvents ? CATEGORY_COLOR[cell.events[0].festival.category] : badge?.color;

          return (
            <button
              key={key}
              onClick={() => onSelect(cell)}
              style={cellTintColor ? { backgroundColor: hexToRgbaVar(cellTintColor, "--badge-tint-alpha", 0.16) } : undefined}
              className={`group relative aspect-[4/6.6] sm:aspect-[4/4.6] rounded-xl sm:rounded-2xl border overflow-hidden transition-all flex flex-col
                ${
                  isSelected
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10"
                    : cellTintColor
                    ? "border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--bg-soft)]"
                    : "border-[color:var(--border-strong)] hover:bg-[color:var(--bg-soft)]"
                }
                ${isToday ? "ring-2 ring-[color:var(--today-ring)] ring-offset-1 ring-offset-[color:var(--bg-elevated)]" : ""}
              `}
            >
              <div className="flex justify-end px-1 pt-1 shrink-0">
                <span
                  className={`rounded-md bg-[color:var(--bg-elevated)]/70 px-1 py-0.5 text-[9px] sm:text-[11px] font-semibold leading-none ${
                    mode === "bn" ? "num-en" : "bn-heading"
                  } ${isSunday ? "text-[color:var(--today-ring)]" : "text-[color:var(--text-muted)]"}`}
                >
                  <AnimatedValue value={secondary} />
                </span>
              </div>

              {hasMultipleEvents ? (
                <MultiEventBadge events={cell.events} mode={mode} primaryDateLabel={primary} isSunday={isSunday} />
              ) : badge ? (
                <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-0.5 pb-1.5 px-1" title={badge.label}>
                  {badge.images ? (
                    <div
                      className="flex-1 w-full min-h-0 rounded-lg sm:rounded-xl p-1"
                      style={{
                        backgroundColor: deepenColor(badge.color),
                        ["--festival-art-tint" as string]: "#000000",
                      }}
                    >
                      <CyclingImage images={badge.images} alt={badge.label} className="h-full w-full" />
                    </div>
                  ) : (
                    <span className="h-7 w-7 sm:h-9 sm:w-9 shrink-0" style={{ color: badge.color }}>
                      <FestivalIconGlyph icon={badge.icon} className="h-full w-full" />
                    </span>
                  )}
                  <MarqueeText
                    text={badge.label}
                    color={badge.color}
                    className="w-full text-[8px] sm:text-[10px] leading-tight bn px-0.5 shrink-0"
                  />
                </div>
              ) : (
                <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                  <span
                    className={`text-2xl sm:text-3xl font-bold leading-none ${mode === "bn" ? "bn" : "num-en"} ${
                      isSunday ? "text-[color:var(--today-ring)]" : ""
                    }`}
                  >
                    <AnimatedValue value={primary} />
                  </span>
                </div>
              )}
            </button>
          );
        })}

        {Array.from({ length: trailing }).map((_, i) => (
          <div key={`trail-${i}`} />
        ))}
      </div>
    </div>
  );
}
