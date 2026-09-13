interface MonthNavProps {
  title: string;
  subtitle: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function MonthNav({ title, subtitle, onPrev, onNext, onToday }: MonthNavProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <button
        onClick={onPrev}
        aria-label="Previous month"
        className="h-10 w-10 shrink-0 grid place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] hover:bg-[color:var(--bg-soft)] transition-colors text-lg"
      >
        ‹
      </button>

      <div className="text-center min-w-0 flex-1">
        <h2 className="text-xl sm:text-2xl font-extrabold bn leading-tight truncate bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-[11px] tracking-[0.2em] text-[color:var(--text-muted)] font-semibold">{subtitle}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToday}
          className="h-9 px-3 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] hover:bg-[color:var(--bg-soft)] transition-colors text-sm font-semibold bn"
        >
          আজ
        </button>
        <button
          onClick={onNext}
          aria-label="Next month"
          className="h-10 w-10 grid place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] hover:bg-[color:var(--bg-soft)] transition-colors text-lg"
        >
          ›
        </button>
      </div>
    </div>
  );
}
