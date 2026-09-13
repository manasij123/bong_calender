// Gregorian <-> Bengali (Bangla) calendar conversion, West Bengal /
// traditional Panjika style: months are solar (sankranti-based) and their
// lengths vary slightly year to year, matching the sidereal transits of the
// Sun rather than a fixed 30/31-day rule. The day a month "turns over" is
// decided by whether the sankranti (the Sun's crossing into the next
// rashi) happens before or after that day's sunset at the reference city
// -- the same convention used by printed West Bengal panjikas.

import { dateToJD } from "./julian.js";
import { longitudesAt } from "./panchang.js";
import { getSunTimes, GeoLocation, KOLKATA } from "./solarTime.js";
import { pMod } from "./julian.js";
import { BENGALI_MONTH_NAMES, BENGALI_WEEKDAY_NAMES } from "./numerals.js";

export interface CalendarDate {
  year: number;
  month: number; // 1-12, Gregorian
  day: number;
}

export function addDays(date: CalendarDate, delta: number): CalendarDate {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + delta));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

export function dateKey(d: CalendarDate): string {
  return `${d.year.toString().padStart(4, "0")}-${d.month.toString().padStart(2, "0")}-${d.day
    .toString()
    .padStart(2, "0")}`;
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return dateKey(a) < dateKey(b) ? -1 : dateKey(a) > dateKey(b) ? 1 : 0;
}

/** Sun's sidereal (Lahiri) longitude at the given local calendar date's sunset. */
function siderealSunLongitudeAtSunset(date: CalendarDate, loc: GeoLocation): number {
  const times = getSunTimes(date.year, date.month, date.day, loc);
  const jd = dateToJD(times.sunsetLocal);
  return longitudesAt(jd).sunSidereal;
}

/** Which Bengali solar-month "slot" (0=Boishakh..11=Chaitra) a date falls in. */
function monthIndexForDate(date: CalendarDate, loc: GeoLocation): number {
  const lng = pMod(siderealSunLongitudeAtSunset(date, loc), 360);
  return Math.floor(lng / 30) % 12;
}

function bengaliYearFor(date: CalendarDate, monthIndex: number): number {
  const { year, month } = date;
  if (month <= 3) return year - 594;
  if (month === 4) return monthIndex === 11 ? year - 594 : year - 593;
  return year - 593;
}

export interface BengaliDate {
  year: number; // Bengali San (e.g. 1433)
  monthIndex: number; // 0-11
  monthName: string;
  day: number; // 1-31/32
  weekday: number; // 0=Sunday..6=Saturday
  weekdayName: string;
  gregorian: CalendarDate;
}

const MAX_MONTH_LENGTH = 32;

/**
 * Convert a Gregorian calendar date (interpreted as a local wall-clock date
 * at `loc`) to its Bengali Panjika equivalent.
 */
export function toBengaliDate(date: CalendarDate, loc: GeoLocation = KOLKATA): BengaliDate {
  const idx = monthIndexForDate(date, loc);

  let day = 1;
  let cursor = date;
  for (let i = 0; i < MAX_MONTH_LENGTH; i++) {
    const prev = addDays(cursor, -1);
    if (monthIndexForDate(prev, loc) === idx) {
      day++;
      cursor = prev;
    } else {
      break;
    }
  }

  const year = bengaliYearFor(date, idx);
  const jsWeekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();

  return {
    year,
    monthIndex: idx,
    monthName: BENGALI_MONTH_NAMES[idx],
    day,
    weekday: jsWeekday,
    weekdayName: BENGALI_WEEKDAY_NAMES[jsWeekday],
    gregorian: date,
  };
}

/**
 * Find the Gregorian date of a given Bengali month's first day (its
 * sankranti / month-start), for a Bengali year `bengaliYear` and
 * `monthIndex` (0=Boishakh..11=Chaitra). Uses a bounded forward scan from a
 * seed estimate, which is cheap since months are ~29-32 days.
 */
export function findBengaliMonthStart(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA
): CalendarDate {
  // Poila Boishakh (monthIndex 0) of Bengali year Y falls around mid-April
  // of Gregorian year (Y + 593). Each subsequent month starts ~30.4 days later.
  const gregorianYearOfPoilaBoishakh = bengaliYear + 593;
  const seedGregorianDate: CalendarDate = { year: gregorianYearOfPoilaBoishakh, month: 4, day: 10 };
  let cursor = addDays(seedGregorianDate, Math.round(monthIndex * 30.44));

  // Walk to make sure we're inside the right month slot, then walk back to day 1.
  for (let guard = 0; guard < 10; guard++) {
    const idx = monthIndexForDate(cursor, loc);
    if (idx === monthIndex) break;
    // Step in the direction that should reduce the gap (roughly 30 days per slot).
    let gap = monthIndex - idx;
    if (gap > 6) gap -= 12;
    if (gap < -6) gap += 12;
    cursor = addDays(cursor, gap * 30);
  }

  for (let i = 0; i < MAX_MONTH_LENGTH + 5; i++) {
    if (monthIndexForDate(cursor, loc) !== monthIndex) {
      cursor = addDays(cursor, 1);
      continue;
    }
    const prev = addDays(cursor, -1);
    if (monthIndexForDate(prev, loc) === monthIndex) {
      cursor = prev;
      continue;
    }
    return cursor;
  }
  return cursor;
}

/** Number of days in a given Bengali month (varies slightly year to year). */
export function bengaliMonthLength(bengaliYear: number, monthIndex: number, loc: GeoLocation = KOLKATA): number {
  const start = findBengaliMonthStart(bengaliYear, monthIndex, loc);
  const nextMonthIndex = (monthIndex + 1) % 12;
  const nextYear = monthIndex === 11 ? bengaliYear + 1 : bengaliYear;
  const nextStart = findBengaliMonthStart(nextYear, nextMonthIndex, loc);
  const msPerDay = 86400000;
  const startMs = Date.UTC(start.year, start.month - 1, start.day);
  const nextMs = Date.UTC(nextStart.year, nextStart.month - 1, nextStart.day);
  return Math.round((nextMs - startMs) / msPerDay);
}

/** All Gregorian dates belonging to a given Bengali month, in order. */
export function getBengaliMonthDates(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA
): CalendarDate[] {
  const start = findBengaliMonthStart(bengaliYear, monthIndex, loc);
  const length = bengaliMonthLength(bengaliYear, monthIndex, loc);
  const dates: CalendarDate[] = [];
  let cursor = start;
  for (let i = 0; i < length; i++) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/** All Gregorian dates that overlap a given Gregorian month (for grid rendering). */
export function getGregorianMonthDates(year: number, month: number): CalendarDate[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dates: CalendarDate[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push({ year, month, day: d });
  }
  return dates;
}

export function today(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
}
