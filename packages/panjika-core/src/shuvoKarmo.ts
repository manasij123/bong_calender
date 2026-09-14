// "Shuvo Karmo" (শুভ কাজ) auspicious-date rules for three common household
// ceremonies: বিবাহ (marriage/Vivaha), অন্নপ্রাশন (a baby's first rice-feeding
// /Annaprashan), and গৃহপ্রবেশ (housewarming/Griha Pravesh). These are the
// standard tithi/nakshatra/weekday/Chaturmas exclusion rules used across
// published Hindu muhurat references (Dharmasindhu, Muhurta Chintamani,
// and modern panchang sites that cite them), not specific to any single
// panjika publisher.
//
// Known simplifications, disclosed rather than silently assumed:
//  - Guru/Shukra "taara asta" (Jupiter/Venus combustion) windows are not
//    checked -- that needs their own ephemeris, which this engine doesn't
//    compute. A day flagged auspicious here can still fall inside a real
//    combustion window.
//  - Adhik Maas (leap month) is not detected/excluded here.
//  - Nakshatra-pada-level exceptions (e.g. Magha/Mula's 1st pada, Revati's
//    4th pada being inauspicious for marriage) aren't applied -- the whole
//    nakshatra is treated uniformly.
//  - Annaprashan's traditional gender/birth-month timing (boys in the
//    6th/8th month, girls in the 5th/7th month from birth) isn't checked,
//    since that needs the baby's own birth date as input; this only
//    flags which days are tithi/nakshatra/weekday-favorable in general.

import { DayInfo } from "./dayInfo.js";
import { dateKey } from "./bengaliCalendar.js";

export type ShuvoKarmoType = "bibaha" | "annaprashan" | "griha-pravesh";

function isRiktaOrAmavasya(tithi: DayInfo["panchang"]["tithi"]): boolean {
  if (tithi.index === 4 || tithi.index === 9 || tithi.index === 14) return true;
  return tithi.paksha === "krishna" && tithi.index === 15;
}

const EXCLUDED_WEEKDAY = new Set([2]); // Tuesday, avoided across all three ceremonies

// Nakshatra indices, 0=Ashwini..26=Revati (matches NAKSHATRA_NAMES in panchang.ts).
const BIBAHA_NAKSHATRA = new Set([3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26]);
const GRIHA_PRAVESH_NAKSHATRA = new Set([3, 4, 11, 13, 16, 20, 25, 26]);
const ANNAPRASHAN_NAKSHATRA = new Set([0, 3, 4, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 23, 25, 26]);

const GRIHA_PRAVESH_TITHI = new Set([2, 3, 5, 10, 11]);
const ANNAPRASHAN_TITHI = new Set([2, 3, 5, 7, 10, 13]);

export interface ShuvoKarmoResult {
  bibaha: boolean;
  annaprashan: boolean;
  grihaPravesh: boolean;
}

/**
 * All shuvo-karmo flags for every day in a full Bengali year's worth of
 * DayInfo (needs the full year, not a single day, to locate that year's
 * Chaturmas window -- Ashadh Shukla Ekadashi through Kartik Shukla
 * Ekadashi -- during which marriage and griha pravesh are traditionally
 * paused).
 */
export function getShuvoKarmoForYear(yearDays: DayInfo[]): Map<string, ShuvoKarmoResult> {
  const chaturmasStart = yearDays.findIndex(
    (d) => d.bengali.monthIndex === 2 && d.panchang.tithi.paksha === "shukla" && d.panchang.tithi.index === 11
  );
  const chaturmasEnd = yearDays.findIndex(
    (d) => d.bengali.monthIndex === 6 && d.panchang.tithi.paksha === "shukla" && d.panchang.tithi.index === 11
  );

  const result = new Map<string, ShuvoKarmoResult>();
  yearDays.forEach((d, idx) => {
    const inChaturmas = chaturmasStart >= 0 && chaturmasEnd >= 0 && idx >= chaturmasStart && idx < chaturmasEnd;
    const { tithi, nakshatra } = d.panchang;
    const weekday = d.bengali.weekday;
    const badTithi = isRiktaOrAmavasya(tithi);
    const badWeekday = EXCLUDED_WEEKDAY.has(weekday);

    const bibaha = !inChaturmas && !badTithi && !badWeekday && BIBAHA_NAKSHATRA.has(nakshatra.index);
    const grihaPravesh =
      !inChaturmas &&
      !badTithi &&
      !badWeekday &&
      GRIHA_PRAVESH_NAKSHATRA.has(nakshatra.index) &&
      GRIHA_PRAVESH_TITHI.has(tithi.index);
    const annaprashan =
      !badWeekday && ANNAPRASHAN_NAKSHATRA.has(nakshatra.index) && ANNAPRASHAN_TITHI.has(tithi.index);

    result.set(dateKey(d.gregorian), { bibaha, annaprashan, grihaPravesh });
  });
  return result;
}
