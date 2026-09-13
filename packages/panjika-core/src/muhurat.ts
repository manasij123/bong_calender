// Kalam (inauspicious-window) calculations: Rahu Kalam, Yamaganda,
// Gulika Kalam. Each divides the sunrise-to-sunset daylight span into 8
// equal parts and assigns a fixed part per weekday -- the standard table
// used across panchang software.
//
// NOTE: these, and the "suitable for" flags below, are traditional
// heuristics for quick reference only, not a substitute for a priest's
// full muhurat calculation (which also weighs nakshatra, lagna, and
// personal charts).

import { GeoLocation, KOLKATA, SunTimes } from "./solarTime.js";
import { TithiInfo } from "./panchang.js";

// index = weekday (0=Sunday..6=Saturday), value = 1-8 (which 1/8th of daylight)
const RAHU_KALAM_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMAGANDA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_KALAM_PART = [7, 6, 5, 4, 3, 2, 1];

export interface TimeWindow {
  start: Date;
  end: Date;
}

function partWindow(sunTimes: SunTimes, weekday: number, table: number[]): TimeWindow {
  const part = table[weekday];
  const dayLengthMs = sunTimes.sunsetLocal.getTime() - sunTimes.sunriseLocal.getTime();
  const partMs = dayLengthMs / 8;
  const start = new Date(sunTimes.sunriseLocal.getTime() + (part - 1) * partMs);
  const end = new Date(sunTimes.sunriseLocal.getTime() + part * partMs);
  return { start, end };
}

export interface KalamWindows {
  rahuKalam: TimeWindow;
  yamaganda: TimeWindow;
  gulikaKalam: TimeWindow;
}

export function getKalamWindows(sunTimes: SunTimes, weekday: number): KalamWindows {
  return {
    rahuKalam: partWindow(sunTimes, weekday, RAHU_KALAM_PART),
    yamaganda: partWindow(sunTimes, weekday, YAMAGANDA_PART),
    gulikaKalam: partWindow(sunTimes, weekday, GULIKA_KALAM_PART),
  };
}

// Traditional tithi groupings used as quick auspiciousness heuristics.
const RIKTA_TITHI = new Set([4, 9, 14]); // 4th, 9th, 14th of either paksha: avoid new beginnings
const NANDA_TITHI = new Set([1, 6, 11]);
const PURNA_TITHI = new Set([5, 10, 15]);

export interface AuspiciousHints {
  /** Simple heuristic: whether the tithi is traditionally "rikta" (avoid starting new work). */
  isRiktaTithi: boolean;
  note: string;
}

/** Very high-level, traditional-heuristic hints -- not a full muhurat calculation. */
export function getAuspiciousHints(tithi: TithiInfo): AuspiciousHints {
  const isRiktaTithi = RIKTA_TITHI.has(tithi.index);
  let note = "";
  if (isRiktaTithi) {
    note = "রিক্তা তিথি — নতুন কাজ শুরুর জন্য শুভ বলে মনে করা হয় না।";
  } else if (NANDA_TITHI.has(tithi.index)) {
    note = "নন্দা তিথি — আনন্দ ও উৎসবের জন্য অনুকূল।";
  } else if (PURNA_TITHI.has(tithi.index)) {
    note = "পূর্ণা তিথি — শুভ কাজের জন্য অনুকূল বলে মনে করা হয়।";
  }
  return { isRiktaTithi, note };
}
