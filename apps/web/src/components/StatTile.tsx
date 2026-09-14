import AnimatedValue from "./AnimatedValue";

interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "shukla" | "krishna" | "default";
}

export default function StatTile({ label, value, sub, accent = "default" }: StatTileProps) {
  const accentClass =
    accent === "shukla" ? "text-[color:var(--shukla)]" : accent === "krishna" ? "text-[color:var(--krishna)]" : "text-[color:var(--text)]";

  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] px-3 py-2.5 flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wide text-[color:var(--text-muted)] font-medium bn">
        {label}
      </span>
      <AnimatedValue value={value} className={`text-base font-semibold bn truncate ${accentClass}`} />
      {sub && <AnimatedValue value={sub} className="text-xs text-[color:var(--text-muted)] bn truncate" />}
    </div>
  );
}
