import { DayCell, dateKey, toBengaliNumber } from "@bong/panjika-core";

const WEEKDAY_HEADERS_BN = ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"];
const WEEKDAY_HEADERS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const NOTABLE_TITHI_INDEX = new Set([11, 15]);

interface CalendarGridProps {
  mode: "bn" | "en";
  cells: DayCell[];
  selectedKey: string | null;
  todayKey: string;
  onSelect: (cell: DayCell) => void;
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
          const event = cell.events[0];
          const tithi = cell.info.panchang.tithi;
          const showTithiTag = !event && NOTABLE_TITHI_INDEX.has(tithi.index);

          return (
            <button
              key={key}
              onClick={() => onSelect(cell)}
              className={`group relative aspect-square sm:aspect-[4/3.4] rounded-lg sm:rounded-xl border px-1 py-1 sm:px-1.5 sm:py-1.5 flex flex-col items-start justify-between text-left transition-all
                ${isSelected ? "border-[color:var(--accent)] bg-[color:var(--accent)]/10" : "border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--bg-soft)]"}
                ${isToday ? "ring-2 ring-[color:var(--today-ring)] ring-offset-1 ring-offset-[color:var(--bg-elevated)]" : ""}
              `}
            >
              <div className="flex items-baseline justify-between w-full">
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

              <div className="w-full min-h-[1rem] flex items-center gap-0.5">
                {event ? (
                  <span className="text-[9px] sm:text-[10px] leading-tight truncate w-full bn" title={event.festival.nameBn}>
                    {event.festival.emoji} {mode === "bn" ? event.festival.nameBn : event.festival.nameEn}
                  </span>
                ) : showTithiTag ? (
                  <span
                    className={`text-[9px] sm:text-[10px] leading-tight truncate w-full bn ${
                      tithi.paksha === "shukla" ? "text-[color:var(--shukla)]" : "text-[color:var(--krishna)]"
                    }`}
                  >
                    {tithi.name}
                  </span>
                ) : null}
              </div>
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
