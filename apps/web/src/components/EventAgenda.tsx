import { DayCell, dateKey, toBengaliNumber, ENGLISH_MONTH_NAMES } from "@bong/panjika-core";

interface EventAgendaProps {
  mode: "bn" | "en";
  cells: DayCell[];
  selectedKey: string | null;
  todayKey: string;
  onSelect: (cell: DayCell) => void;
}

export default function EventAgenda({ mode, cells, selectedKey, todayKey, onSelect }: EventAgendaProps) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/60 shadow-glow overflow-hidden">
      <div className="max-h-[420px] lg:max-h-[560px] overflow-y-auto divide-y divide-[color:var(--border)]">
        {cells.map((cell) => {
          const key = dateKey(cell.date);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const dateLabel =
            mode === "bn"
              ? `${toBengaliNumber(cell.date.day)} ${["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"][cell.date.month - 1]} ${toBengaliNumber(cell.date.year)}`
              : `${cell.date.day} ${ENGLISH_MONTH_NAMES[cell.date.month - 1]} ${cell.date.year}`;

          return (
            <button
              key={key}
              onClick={() => onSelect(cell)}
              className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between gap-3 ${
                isSelected ? "bg-[color:var(--accent)]/10" : "hover:bg-[color:var(--bg-soft)]"
              }`}
            >
              <div className="min-w-0">
                <p className={`text-sm font-semibold bn ${isToday ? "text-[color:var(--today-ring)]" : ""}`}>
                  {dateLabel}, {cell.info.bengali.weekdayName}
                </p>
                {cell.events.length > 0 ? (
                  <p className="text-xs text-[color:var(--text-muted)] bn truncate">
                    {cell.events.map((e) => `${e.festival.emoji} ${mode === "bn" ? e.festival.nameBn : e.festival.nameEn}`).join(" · ")}
                  </p>
                ) : (
                  <p className="text-xs text-[color:var(--text-muted)]/70 bn truncate">
                    {cell.info.panchang.tithi.name} · {cell.info.panchang.nakshatra.name}
                  </p>
                )}
              </div>
              {mode === "bn" ? (
                <span className="text-xs text-[color:var(--text-muted)] shrink-0 num-en">{cell.date.month}/{cell.date.day}</span>
              ) : (
                <span className="text-xs text-[color:var(--text-muted)] shrink-0 bn">{toBengaliNumber(cell.info.bengali.day)} {cell.info.bengali.monthName}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
