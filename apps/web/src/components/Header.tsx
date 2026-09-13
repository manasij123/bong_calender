interface HeaderProps {
  mode: "bn" | "en";
  onModeChange: (mode: "bn" | "en") => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onOpenSearch: () => void;
}

export default function Header({ mode, onModeChange, theme, onThemeToggle, onOpenSearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-[color:var(--bg-elevated)] border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-2 sm:px-5 py-3 flex items-center justify-between gap-1.5 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <img src="/logo-192.png" alt="বাংলা পঞ্জিকা" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl shadow-glow" />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold bn leading-tight truncate">বাংলা পঞ্জিকা</h1>
            <p className="hidden sm:block text-[11px] text-[color:var(--text-muted)] leading-tight truncate">
              Bengali Panjika · কলকাতা
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <div className="flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-0.5 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => onModeChange("bn")}
              className={`px-2 sm:px-3 py-1.5 rounded-full transition-colors bn ${
                mode === "bn" ? "bg-[color:var(--accent)] text-black" : "text-[color:var(--text-muted)]"
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => onModeChange("en")}
              className={`px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                mode === "en" ? "bg-[color:var(--accent)] text-black" : "text-[color:var(--text-muted)]"
              }`}
            >
              English
            </button>
          </div>
          <button
            onClick={onOpenSearch}
            aria-label="Search"
            className="h-11 w-11 grid place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] text-base"
          >
            🔍
          </button>
          <button
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            className="h-11 w-11 grid place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] text-base"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
