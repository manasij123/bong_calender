import { PanchangSystem } from "@bong/panjika-core";

interface HeaderProps {
  mode: "bn" | "en";
  onModeChange: (mode: "bn" | "en") => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onOpenSearch: () => void;
  onOpenShuvoKarmo: () => void;
  system: PanchangSystem;
  onSystemChange: (system: PanchangSystem) => void;
}

export default function Header({
  mode,
  onModeChange,
  theme,
  onThemeToggle,
  onOpenSearch,
  onOpenShuvoKarmo,
  system,
  onSystemChange,
}: HeaderProps) {
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
            onClick={onOpenShuvoKarmo}
            aria-label="Shuvo Karmo"
            title="শুভ কাজের দিন (বিবাহ/অন্নপ্রাশন/গৃহপ্রবেশ)"
            className="h-11 w-11 grid place-items-center rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elevated)] text-base"
          >
            💍
          </button>
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

      <div className="border-t border-[color:var(--border)] bg-[color:var(--bg-soft)]/40">
        <div className="mx-auto max-w-6xl px-2 sm:px-5 py-1.5 flex items-center justify-center gap-2">
          <span className="hidden sm:inline text-[11px] text-[color:var(--text-muted)] bn shrink-0">
            পঞ্জিকা রীতি
          </span>
          <div className="flex rounded-full border border-[color:var(--border)] p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => onSystemChange("surya-siddhanta")}
              title="সূর্যসিদ্ধান্ত (ঐতিহ্যগত পঞ্জিকা)"
              className={`px-2.5 py-1 rounded-full transition-colors bn ${
                system === "surya-siddhanta" ? "bg-[color:var(--accent-3)] text-black" : "text-[color:var(--text-muted)]"
              }`}
            >
              ঐতিহ্যগত (সূর্য)
            </button>
            <button
              onClick={() => onSystemChange("drik")}
              title="দৃকসিদ্ধান্ত (আধুনিক জ্যোতির্বৈজ্ঞানিক পঞ্জিকা)"
              className={`px-2.5 py-1 rounded-full transition-colors bn ${
                system === "drik" ? "bg-[color:var(--accent-3)] text-black" : "text-[color:var(--text-muted)]"
              }`}
            >
              আধুনিক (দৃক)
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
