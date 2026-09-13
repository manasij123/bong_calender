interface HeaderProps {
  mode: "bn" | "en";
  onModeChange: (mode: "bn" | "en") => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export default function Header({ mode, onModeChange, theme, onThemeToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[color:var(--bg)]/85 border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-3 sm:px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] grid place-items-center text-lg shadow-glow">
            🪔
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold bn leading-tight truncate">বাংলা পঞ্জিকা</h1>
            <p className="text-[11px] text-[color:var(--text-muted)] leading-tight truncate">
              Bengali Panjika · কলকাতা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-0.5 text-sm font-semibold">
            <button
              onClick={() => onModeChange("bn")}
              className={`px-3 py-1.5 rounded-full transition-colors bn ${
                mode === "bn" ? "bg-[color:var(--accent)] text-black" : "text-[color:var(--text-muted)]"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => onModeChange("en")}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                mode === "en" ? "bg-[color:var(--accent)] text-black" : "text-[color:var(--text-muted)]"
              }`}
            >
              English
            </button>
          </div>
          <button
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] text-base"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
