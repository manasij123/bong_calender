// Islamic (Hijri) calendar - tabular/arithmetic civil calendar (the
// "Kuwaiti algorithm" scheme used by, e.g., Windows and many calendar
// libraries): months alternate 30/29 days with a 30-year leap-year cycle,
// rather than actual moon-sighting. This is a well-documented, deterministic
// approximation - real-world Eid/Muharram announcements (based on lunar
// sighting committees in Bangladesh, Saudi Arabia, etc.) can fall a day or
// two either side of the calculated date here, the same kind of variance
// as the Bengali sankranti caveat elsewhere in this package.

import { jdToCalendar, gregorianToJD } from "./julian.js";

const HIJRI_EPOCH_JD = 1948440;

export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;
}

/** Hijri (Y, M, D) -> Julian Day (civil/tabular calendar). */
export function hijriToJD(date: HijriDate): number {
  const { year: Y, month: M, day: D } = date;
  return (
    D +
    Math.ceil(29.5 * (M - 1)) +
    (Y - 1) * 354 +
    Math.floor((3 + 11 * Y) / 30) +
    HIJRI_EPOCH_JD -
    1
  );
}

/** Julian Day -> Hijri (Y, M, D) (civil/tabular calendar). */
export function jdToHijri(jd: number): HijriDate {
  const jdInt = Math.floor(jd);
  let l = jdInt - HIJRI_EPOCH_JD + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;
  return { year, month, day };
}

// hijriToJD/jdToHijri operate on Julian Day *Numbers* (whole-day counts,
// where a new day begins at midnight) - the convention the epoch constant
// and formula are defined in. julian.ts's gregorianToJD/jdToCalendar use
// the astronomical Julian Date convention instead (integers land on noon,
// so midnight of a calendar day is JD + 0.5 short of the next integer).
// Converting between the two conventions needs a +/-0.5 day shift.

export function gregorianToHijri(year: number, month: number, day: number): HijriDate {
  const jdn = Math.round(gregorianToJD(year, month, day) + 0.5);
  return jdToHijri(jdn);
}

export function hijriToGregorian(date: HijriDate): { year: number; month: number; day: number } {
  const jdn = hijriToJD(date);
  const cal = jdToCalendar(jdn - 0.5);
  return { year: cal.year, month: cal.month, day: Math.round(cal.day) };
}
