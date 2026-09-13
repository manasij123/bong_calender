import { DayCell, dateKey, toBengaliNumber } from "@bong/panjika-core";
import FestivalIconGlyph, { IconKey } from "./festivalIcons";
import { CATEGORY_COLOR, TITHI_BADGE_COLOR, hexToRgba } from "../lib/festivalColor";

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
  color: string;
  label: string;
}

function badgeFor(cell: DayCell, mode: "bn" | "en"): CellBadge | null {
  const event = cell.events[0];
  if (event) {
    return {
      icon: event.festival.icon,
      color: CATEGORY_COLOR[event.festival.category],
      label: mode === "bn" ? event.festival.nameBn : event.festival.nameEn,
    };
  }
  const tithi = cell.info.panchang.tithi;
  if (tithi.index === 15) {
    return tithi.paksha === "shukla"
      ? { icon: "moon-full", color: TITHI_BADGE_COLOR.purnima, label: tithi.name }
      : { icon: "moon-new", color: TITHI_BADGE_COLOR.amavasya, label: tithi.name };
  }
  if (tithi.index === 11) {
    return { icon: "ekadashi", color: TITHI_BADGE_COLOR.ekadashi, label: tithi.name };
  }
  return null;
}

export default function CalendarGrid({ mode, cells, selectedKey, todayKey, onSelect }: CalendarGridProps) {
  if (cells.length === 0) return null;
  const leading = cells[0].info.bengali.weekday;
  const trailing = (7 - ((leading + cells.length) % 7)) % 7;
  const headers = mode === "bn" ? WEEKDAY_HEADERS_BN : WEEKDAY_HEADERS_EN;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/60 p-2 sm:p-3 shadow-glow">
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {headers.map((h, i) => (
          <div
            key={h}
            className={`text-center text-[11px] sm:text-xs font-bold py-1.5 bn ${
              i === 0 ? "text-[color:var(--today-ring)]" : "text-[color:var(--text-muted)]"
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
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
              className={`group relative aspect-square sm:aspect-[4/4.2] rounded-lg sm:rounded-xl border px-1 py-1 sm:px-1.5 sm:py-1.5 flex flex-col items-start text-left transition-all
                ${isSelected ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10" : "border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--bg-soft)]"}
                ${isToday ? "ring-2 ring-[color:var(--today-ring)] ring-offset-1 ring-offset-[color:var(--bg-elevated)]" : ""}
              `}
            >
              <div className="flex items-baseline justify-between w-full shrink-0">
                <span
                  className={`text-sm sm:text-lg font-bold leading-none ${mode === "bn" ? "bn" : "num-en"} ${
                    isSunday ? "text-[color:var(--today-ring)]" : ""
                  }`}
                >
                  {primary}
                </span>
                <span className={`text-[9px] sm:text-[10px] text-[color:var(--text-muted)] leading-none ${mode === "bn" ? "num-en" : "bn"}`}>
                  {secondary}
                </span>
              </div>

              {badge && (
                <div
                  className="mt-0.5 flex-1 w-full min-h-0 rounded-md sm:rounded-lg flex flex-col items-center justify-center gap-0.5 py-0.5 px-0.5 overflow-hidden"
                  style={{
                    backgroundColor: hexToRgba(badge.color, 0.16),
                    border: `1px solid ${hexToRgba(badge.color, 0.45)}`,
                  }}
                  title={badge.label}
                >
                  <span className="h-4 w-4 sm:h-6 sm:w-6 shrink-0" style={{ color: badge.color }}>
                    <FestivalIconGlyph icon={badge.icon} className="h-full w-full" />
                  </span>
                  <span
                    className="text-[6.5px] sm:text-[8px] leading-tight text-center bn line-clamp-1 px-0.5"
                    style={{ color: badge.color }}
                  >
                    {badge.label}
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
