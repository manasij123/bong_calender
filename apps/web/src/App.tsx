import { useEffect, useMemo, useState } from "react";
import { ClipboardList, ArrowRight } from "lucide-react";
import {
  CalendarDate,
  DayCell,
  KOLKATA,
  PanchangSystem,
  dateKey,
  getBengaliMonthGrid,
  getDayDetail,
  getGregorianMonthGrid,
  toBengaliDateDisplay,
  today,
  toBengaliNumber,
  BENGALI_MONTH_NAMES,
  ENGLISH_MONTH_NAMES,
} from "@bong/panjika-core";
import Header from "./components/Header";
import MonthNav from "./components/MonthNav";
import CalendarGrid from "./components/CalendarGrid";
import DayDetailPanel from "./components/DayDetailPanel";
import EventAgenda from "./components/EventAgenda";
import MobileSlideDrawer from "./components/MobileSlideDrawer";
import SearchOverlay from "./components/SearchOverlay";
import ShuvoKarmoOverlay from "./components/ShuvoKarmoOverlay";

type Mode = "bn" | "en";
type Theme = "dark" | "light";

const EN_MONTH_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("panjika-theme") : null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("panjika-theme", theme);
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

function useSystem(): [PanchangSystem, (s: PanchangSystem) => void] {
  const [system, setSystem] = useState<PanchangSystem>(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("panjika-system") : null;
    return stored === "drik" || stored === "surya-siddhanta" ? stored : "surya-siddhanta";
  });

  useEffect(() => {
    window.localStorage.setItem("panjika-system", system);
  }, [system]);

  return [system, setSystem];
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [system, setSystem] = useSystem();
  const t = useMemo(() => today(), []);
  const tb = useMemo(() => toBengaliDateDisplay(t, KOLKATA, system), [t, system]);
  const todayKey = dateKey(t);

  const [mode, setMode] = useState<Mode>("bn");
  const [bengaliYear, setBengaliYear] = useState(tb.year);
  const [bengaliMonthIndex, setBengaliMonthIndex] = useState(tb.monthIndex);
  const [gregorianYear, setGregorianYear] = useState(t.year);
  const [gregorianMonth, setGregorianMonth] = useState(t.month);
  const [selectedDate, setSelectedDate] = useState<CalendarDate>(t);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileAgendaOpen, setMobileAgendaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shuvoKarmoOpen, setShuvoKarmoOpen] = useState(false);

  const cells = useMemo<DayCell[]>(() => {
    return mode === "bn"
      ? getBengaliMonthGrid(bengaliYear, bengaliMonthIndex, KOLKATA, system)
      : getGregorianMonthGrid(gregorianYear, gregorianMonth, KOLKATA, system);
  }, [mode, bengaliYear, bengaliMonthIndex, gregorianYear, gregorianMonth, system]);

  const selectedDetail = useMemo(() => getDayDetail(selectedDate, KOLKATA, system), [selectedDate, system]);

  // Bengali month boundaries differ between systems, so re-derive the
  // Bengali-mode view (year/month) for whichever date is currently selected
  // whenever the system toggle changes, instead of leaving it stale.
  useEffect(() => {
    if (mode !== "bn") return;
    const bd = toBengaliDateDisplay(selectedDate, KOLKATA, system);
    setBengaliYear(bd.year);
    setBengaliMonthIndex(bd.monthIndex);
  }, [system]);

  function handleModeChange(next: Mode) {
    if (next === mode) return;
    if (next === "en") {
      setGregorianYear(selectedDate.year);
      setGregorianMonth(selectedDate.month);
    } else {
      const bd = toBengaliDateDisplay(selectedDate, KOLKATA, system);
      setBengaliYear(bd.year);
      setBengaliMonthIndex(bd.monthIndex);
    }
    setMode(next);
  }

  function handlePrev() {
    if (mode === "bn") {
      if (bengaliMonthIndex === 0) {
        setBengaliYear((y) => y - 1);
        setBengaliMonthIndex(11);
      } else {
        setBengaliMonthIndex((m) => m - 1);
      }
    } else {
      if (gregorianMonth === 1) {
        setGregorianYear((y) => y - 1);
        setGregorianMonth(12);
      } else {
        setGregorianMonth((m) => m - 1);
      }
    }
  }

  function handleNext() {
    if (mode === "bn") {
      if (bengaliMonthIndex === 11) {
        setBengaliYear((y) => y + 1);
        setBengaliMonthIndex(0);
      } else {
        setBengaliMonthIndex((m) => m + 1);
      }
    } else {
      if (gregorianMonth === 12) {
        setGregorianYear((y) => y + 1);
        setGregorianMonth(1);
      } else {
        setGregorianMonth((m) => m + 1);
      }
    }
  }

  function handleToday() {
    setBengaliYear(tb.year);
    setBengaliMonthIndex(tb.monthIndex);
    setGregorianYear(t.year);
    setGregorianMonth(t.month);
    setSelectedDate(t);
  }

  function handleSelect(cell: DayCell) {
    setSelectedDate(cell.date);
    setMobileDrawerOpen(true);
  }

  function handleSelectFromAgenda(cell: DayCell) {
    setSelectedDate(cell.date);
    setMobileAgendaOpen(false);
    setMobileDrawerOpen(true);
  }

  function handleSearchSelectDate(date: CalendarDate) {
    if (mode === "bn") {
      const bd = toBengaliDateDisplay(date, KOLKATA, system);
      setBengaliYear(bd.year);
      setBengaliMonthIndex(bd.monthIndex);
    } else {
      setGregorianYear(date.year);
      setGregorianMonth(date.month);
    }
    setSelectedDate(date);
    setMobileDrawerOpen(true);
  }

  const title =
    mode === "bn"
      ? `${BENGALI_MONTH_NAMES[bengaliMonthIndex]} ${toBengaliNumber(bengaliYear)}`
      : `${ENGLISH_MONTH_NAMES[gregorianMonth - 1]} ${gregorianYear}`;

  const subtitle = useMemo(() => {
    if (cells.length === 0) return "";
    const first = cells[0];
    const last = cells[cells.length - 1];
    if (mode === "bn") {
      const startLabel = `${EN_MONTH_SHORT[first.date.month - 1]}`;
      const endLabel = `${EN_MONTH_SHORT[last.date.month - 1]}`;
      const span = startLabel === endLabel ? startLabel : `${startLabel}-${endLabel}`;
      return `${span} ${last.date.year}`;
    }
    const startBn = first.info.displayBengali;
    const endBn = last.info.displayBengali;
    const span =
      startBn.monthIndex === endBn.monthIndex
        ? BENGALI_MONTH_NAMES[startBn.monthIndex]
        : `${BENGALI_MONTH_NAMES[startBn.monthIndex]}-${BENGALI_MONTH_NAMES[endBn.monthIndex]}`;
    return `${span} ${toBengaliNumber(endBn.year)}`;
  }, [cells, mode]);

  return (
    <div className="min-h-screen pb-10">
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        theme={theme}
        onThemeToggle={toggleTheme}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenShuvoKarmo={() => setShuvoKarmoOpen(true)}
        system={system}
        onSystemChange={setSystem}
      />

      <main className="mx-auto max-w-6xl px-3 sm:px-5 pt-3 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <MonthNav title={title} subtitle={subtitle} onPrev={handlePrev} onNext={handleNext} onToday={handleToday} />
          <CalendarGrid
            mode={mode}
            cells={cells}
            selectedKey={dateKey(selectedDate)}
            todayKey={todayKey}
            onSelect={handleSelect}
          />
          <button
            onClick={() => setMobileAgendaOpen(true)}
            className="lg:hidden flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/60 px-4 py-3 shadow-glow text-left"
          >
            <span className="bn font-semibold flex items-center gap-2">
              <ClipboardList aria-hidden style={{ width: "1.1rem", height: "1.1rem" }} />
              মাসের তালিকা দেখুন
            </span>
            <ArrowRight aria-hidden className="text-[color:var(--text-muted)]" style={{ width: "1.1rem", height: "1.1rem" }} />
          </button>
          <div className="hidden lg:block">
            <EventAgenda mode={mode} cells={cells} selectedKey={dateKey(selectedDate)} todayKey={todayKey} onSelect={handleSelect} />
          </div>
        </div>

        <div className="hidden lg:block sticky top-20">
          <DayDetailPanel detail={selectedDetail} mode={mode} system={system} />
        </div>
      </main>

      <MobileSlideDrawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)} closeLabel="বন্ধ করুন">
        <DayDetailPanel detail={selectedDetail} mode={mode} system={system} />
      </MobileSlideDrawer>

      <MobileSlideDrawer open={mobileAgendaOpen} onClose={() => setMobileAgendaOpen(false)} closeLabel="বন্ধ করুন">
        <EventAgenda mode={mode} cells={cells} selectedKey={dateKey(selectedDate)} todayKey={todayKey} onSelect={handleSelectFromAgenda} />
      </MobileSlideDrawer>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mode={mode}
        system={system}
        onSelectDate={handleSearchSelectDate}
      />

      <ShuvoKarmoOverlay
        open={shuvoKarmoOpen}
        onClose={() => setShuvoKarmoOpen(false)}
        mode={mode}
        cells={cells}
        loc={KOLKATA}
        system={system}
      />

      <footer className="mx-auto max-w-6xl px-5 pt-6 text-center text-[11px] text-[color:var(--text-muted)] bn">
        তৈরি হয়েছে ভালোবাসা দিয়ে — বাংলা পঞ্জিকা ওয়েব ও ডেস্কটপ অ্যাপ
      </footer>
    </div>
  );
}
