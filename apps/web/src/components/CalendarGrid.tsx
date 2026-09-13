import { DayCell, dateKey, toBengaliNumber } from "@bong/panjika-core";
import FestivalIconGlyph, { IconKey } from "./festivalIcons";
import CyclingImage from "./CyclingImage";
import MarqueeText from "./MarqueeText";
import { CATEGORY_COLOR, TITHI_BADGE_COLOR, hexToRgba } from "../lib/festivalColor";
import { FESTIVAL_IMAGES, TITHI_IMAGES } from "../lib/festivalImages";

const WEEKDAY_HEADERS_BN = ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"];
const WEEKDAY_HEADERS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
  const leading = cells[0].info.bengali.weekday;
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
          const isSunday = cell.info.bengali.weekday === 0;
          const primary = mode === "bn" ? toBengaliNumber(cell.info.bengali.day) : String(cell.date.day);
          const secondary = mode === "bn" ? String(cell.date.day) : toBengaliNumber(cell.info.bengali.day);
          const badge = badgeFor(cell, mode);

          return (
            <button
              key={key}
              onClick={() => onSelect(cell)}
              style={badge ? { backgroundColor: hexToRgba(badge.color, 0.16) } : undefined}
              className={`group relative aspect-[4/6.6] sm:aspect-[4/4.6] rounded-xl sm:rounded-2xl border overflow-hidden transition-all flex flex-col
                ${isSelected ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10" : "border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--bg-soft)]"}
                ${isToday ? "ring-2 ring-[color:var(--today-ring)] ring-offset-1 ring-offset-[color:var(--bg-elevated)]" : ""}
              `}
            >
              <div className="flex justify-end px-1 pt-1 shrink-0">
                <span
                  className={`rounded-md bg-[color:var(--bg-elevated)]/70 px-1 py-0.5 text-[9px] sm:text-[11px] font-semibold leading-none ${
                    mode === "bn" ? "num-en" : "bn"
                  } ${isSunday ? "text-[color:var(--today-ring)]" : "text-[color:var(--text-muted)]"}`}
                >
                  {secondary}
                </span>
              </div>

              {badge ? (
                <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-0.5 pb-1.5 px-1" title={badge.label}>
                  {badge.images ? (
                    <CyclingImage images={badge.images} alt={badge.label} className="flex-1 w-full min-h-0" />
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
                    {primary}
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
