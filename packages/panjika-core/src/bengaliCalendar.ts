// Gregorian <-> Bengali (Bangla) calendar conversion, West Bengal /
// traditional Panjika style: months are solar (sankranti-based) and their
// lengths vary slightly year to year, matching the sidereal transits of the
// Sun rather than a fixed 30/31-day rule. The day a month "turns over" is
// decided by whether the sankranti (the Sun's crossing into the next
// rashi) happens before or after that day's sunset at the reference city
// -- the same convention used by printed West Bengal panjikas.

import { dateToJD, rad2deg } from "./julian.js";
import { jdToJDE, jdeCentury } from "./julian.js";
import { sunApparentLongitude } from "./sun.js";
import { lahiriAyanamsaDeg } from "./ayanamsa.js";
import { getSunTimes, GeoLocation, KOLKATA } from "./solarTime.js";
import { pMod } from "./julian.js";
import { BENGALI_MONTH_NAMES, BENGALI_WEEKDAY_NAMES } from "./numerals.js";
import {
  PanchangSystem,
  suryaSiddhantaSunSiderealLongitudeDeg,
} from "./suryaSiddhanta.js";

// Bengali solar months turn over when the Sun crosses into the next rashi
// (sidereal sign) -- but "the Sun's sidereal longitude" isn't a single
// number: printed West Bengal panjikas (Gupta Press / P.M. Bagchi /
// Benimadhab Seal Directory lineage) still follow the classical Surya
// Siddhanta mean-motion model (see suryaSiddhanta.ts), which runs
// sankranti dates about 1-2 days later than a precise modern ("Drik")
// ephemeris. Both are offered here as a user-facing toggle.

/** Sun's sidereal longitude under the given panchang system. */
function siderealSunLongitudeDeg(jd: number, system: PanchangSystem): number {
  if (system === "surya-siddhanta") return suryaSiddhantaSunSiderealLongitudeDeg(jd);
  const T = jdeCentury(jdToJDE(jd));
  const apparentDeg = pMod(rad2deg(sunApparentLongitude(T)), 360);
  return pMod(apparentDeg - lahiriAyanamsaDeg(jd), 360);
}

/**
 * Empirically calibrated correction to the drik sankranti (solar
 * month-boundary) decision only -- NOT a general ayanamsa fix, and not
 * applied to tithi/nakshatra/yoga/karana (which don't depend on the
 * ayanamsa's absolute value: sidereal Sun/Moon longitudes both shift by
 * the same ayanamsa, so it cancels out of every angle *between* them).
 *
 * Confirmed directly from the "Bong Calendar" app's own Day Detail
 * headers (not inferred from a festival date or a day count) across two
 * years and four different rashi transitions:
 *   Poush 1, 1432  = 17 Dec 2025  (Sun crosses into Dhanu,  240 deg)
 *   Magh 1, 1432   = 16 Jan 2026  (Sun crosses into Makar,  270 deg)
 *   Bhadra 1, 1433 = 19 Aug 2026  (Sun crosses into Simha,  120 deg)
 *   Ashwin 1, 1433 = 18 Sep 2026  (Sun crosses into Kanya,  150 deg)
 * Each constraint pins down a range this correction must fall in to
 * reproduce that transition's date; the four ranges' intersection is
 * (1.5016 deg, 1.5046 deg] -- narrow, but non-empty, so a single
 * constant genuinely satisfies all four independently-confirmed
 * transitions rather than being fit to just one. This app's own drik
 * path (sun.ts's Meeus apparent longitude + ayanamsa.ts's Lahiri
 * formula) isn't wrong astronomy -- it just sits close enough to the
 * original Lahiri notification's reference epoch/convention that,
 * without this correction, every rashi transition landed 1-2 days
 * earlier than this specific app.
 *
 * This is an empirically calibrated correction for the transitions
 * checked, not a universally proven constant -- there's no direct APK
 * evidence yet for every rashi boundary (Mesha/Poila Boishakh
 * included). It's applied as one constant across the year rather than
 * a per-month special case, which is the more defensible choice absent
 * evidence it should vary, but it hasn't been confirmed at every
 * boundary.
 */
const DRIK_SANKRANTI_AYANAMSA_ADJUSTMENT_DEG = 1.503;

/**
 * Sun's sidereal longitude for deciding Bengali month boundaries only
 * (see toBengaliDateDisplay). Deliberately separate from
 * siderealSunLongitudeDeg/monthIndexForDate above, which the tithi
 * festival resolver's month-window search depends on: shifting *that*
 * function changes which lunar-month occurrence a tithi rule finds
 * (proven by regression testing -- it moved Durga Puja, Mahalaya and
 * others by up to a full lunar month), so it's left untouched, and this
 * correction is confined to the separate "what date is this, for
 * display and for purely-solar festival rules" path below.
 */
function siderealSunLongitudeDegDisplay(jd: number, system: PanchangSystem): number {
  const raw = siderealSunLongitudeDeg(jd, system);
  if (system === "surya-siddhanta") return raw;
  return pMod(raw - DRIK_SANKRANTI_AYANAMSA_ADJUSTMENT_DEG, 360);
}

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

/** Sun's sidereal longitude at the given local calendar date's sunset. */
function siderealSunLongitudeAtSunset(date: CalendarDate, loc: GeoLocation, system: PanchangSystem): number {
  const times = getSunTimes(date.year, date.month, date.day, loc);
  const jd = dateToJD(times.sunsetLocal);
  return siderealSunLongitudeDeg(jd, system);
}

/** Which Bengali solar-month "slot" (0=Boishakh..11=Chaitra) a date falls in. */
function monthIndexForDate(date: CalendarDate, loc: GeoLocation, system: PanchangSystem): number {
  const lng = pMod(siderealSunLongitudeAtSunset(date, loc, system), 360);
  return Math.floor(lng / 30) % 12;
}

/** Sun's sidereal longitude (display-corrected) at the given date's sunset. */
function siderealSunLongitudeAtSunsetDisplay(date: CalendarDate, loc: GeoLocation, system: PanchangSystem): number {
  const times = getSunTimes(date.year, date.month, date.day, loc);
  const jd = dateToJD(times.sunsetLocal);
  return siderealSunLongitudeDegDisplay(jd, system);
}

/**
 * Which Bengali solar-month "slot" a date falls in, using the
 * display-corrected drik sankranti boundary (see
 * DRIK_SANKRANTI_AYANAMSA_ADJUSTMENT_DEG). Only for display and
 * purely-solar festival rules -- see toBengaliDateDisplay.
 */
function monthIndexForDateDisplay(date: CalendarDate, loc: GeoLocation, system: PanchangSystem): number {
  const lng = pMod(siderealSunLongitudeAtSunsetDisplay(date, loc, system), 360);
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

/** Shared by toBengaliDate and toBengaliDateDisplay -- only the month-index function differs. */
function computeBengaliDate(date: CalendarDate, monthIndexFn: (d: CalendarDate) => number): BengaliDate {
  const idx = monthIndexFn(date);

  let day = 1;
  let cursor = date;
  for (let i = 0; i < MAX_MONTH_LENGTH; i++) {
    const prev = addDays(cursor, -1);
    if (monthIndexFn(prev) === idx) {
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
 * Convert a Gregorian calendar date (interpreted as a local wall-clock date
 * at `loc`) to its Bengali Panjika equivalent. This is the internal
 * convention the tithi festival resolver's month-window search relies
 * on (see festivals.ts) -- deliberately unaffected by
 * DRIK_SANKRANTI_AYANAMSA_ADJUSTMENT_DEG. For the user-visible date
 * (calendar display, purely-solar festival rules), use
 * toBengaliDateDisplay instead.
 */
export function toBengaliDate(
  date: CalendarDate,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): BengaliDate {
  return computeBengaliDate(date, (d) => monthIndexForDate(d, loc, system));
}

/**
 * Same as toBengaliDate, but using the display-corrected drik sankranti
 * boundary (identical to toBengaliDate under surya-siddhanta, where
 * there is no correction). Use this for anything the user sees --
 * calendar day numbers, the day-detail date header -- and for
 * bengaliMonthDay/bengaliMonthLastDay festival rules. Do not use it for
 * tithi-rule month-window filtering.
 */
export function toBengaliDateDisplay(
  date: CalendarDate,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): BengaliDate {
  return computeBengaliDate(date, (d) => monthIndexForDateDisplay(d, loc, system));
}

/**
 * Shared by findBengaliMonthStart and findBengaliMonthStartDisplay --
 * only the month-index function differs. Finds the Gregorian date of a
 * given Bengali month's first day (its sankranti / month-start), for a
 * Bengali year `bengaliYear` and `monthIndex` (0=Boishakh..11=Chaitra).
 * Uses a bounded forward scan from a seed estimate, which is cheap since
 * months are ~29-32 days.
 */
function computeBengaliMonthStart(
  bengaliYear: number,
  monthIndex: number,
  monthIndexFn: (d: CalendarDate) => number
): CalendarDate {
  // Poila Boishakh (monthIndex 0) of Bengali year Y falls around mid-April
  // of Gregorian year (Y + 593). Each subsequent month starts ~30.4 days later.
  const gregorianYearOfPoilaBoishakh = bengaliYear + 593;
  const seedGregorianDate: CalendarDate = { year: gregorianYearOfPoilaBoishakh, month: 4, day: 10 };
  let cursor = addDays(seedGregorianDate, Math.round(monthIndex * 30.44));

  // Walk to make sure we're inside the right month slot, then walk back to day 1.
  for (let guard = 0; guard < 10; guard++) {
    const idx = monthIndexFn(cursor);
    if (idx === monthIndex) break;
    // Step in the direction that should reduce the gap (roughly 30 days per slot).
    let gap = monthIndex - idx;
    if (gap > 6) gap -= 12;
    if (gap < -6) gap += 12;
    cursor = addDays(cursor, gap * 30);
  }

  for (let i = 0; i < MAX_MONTH_LENGTH + 5; i++) {
    if (monthIndexFn(cursor) !== monthIndex) {
      cursor = addDays(cursor, 1);
      continue;
    }
    const prev = addDays(cursor, -1);
    if (monthIndexFn(prev) === monthIndex) {
      cursor = prev;
      continue;
    }
    return cursor;
  }
  return cursor;
}

/**
 * Find the Gregorian date of a given Bengali month's first day. Internal
 * convention -- see toBengaliDate. Used to build the tithi resolver's
 * per-year day list (dayInfo.ts); not for calendar-grid rendering.
 */
export function findBengaliMonthStart(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): CalendarDate {
  return computeBengaliMonthStart(bengaliYear, monthIndex, (d) => monthIndexForDate(d, loc, system));
}

/**
 * Same as findBengaliMonthStart, but using the display-corrected drik
 * sankranti boundary -- see toBengaliDateDisplay. Use this for anything
 * the user navigates to or sees (the calendar month grid).
 */
export function findBengaliMonthStartDisplay(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): CalendarDate {
  return computeBengaliMonthStart(bengaliYear, monthIndex, (d) => monthIndexForDateDisplay(d, loc, system));
}

function monthLengthFrom(
  bengaliYear: number,
  monthIndex: number,
  findStart: (by: number, mi: number) => CalendarDate
): number {
  const start = findStart(bengaliYear, monthIndex);
  const nextMonthIndex = (monthIndex + 1) % 12;
  const nextYear = monthIndex === 11 ? bengaliYear + 1 : bengaliYear;
  const nextStart = findStart(nextYear, nextMonthIndex);
  const msPerDay = 86400000;
  const startMs = Date.UTC(start.year, start.month - 1, start.day);
  const nextMs = Date.UTC(nextStart.year, nextStart.month - 1, nextStart.day);
  return Math.round((nextMs - startMs) / msPerDay);
}

/** Number of days in a given Bengali month (varies slightly year to year). Internal convention. */
export function bengaliMonthLength(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): number {
  return monthLengthFrom(bengaliYear, monthIndex, (by, mi) => findBengaliMonthStart(by, mi, loc, system));
}

/** Same as bengaliMonthLength, but using the display-corrected drik sankranti boundary. */
export function bengaliMonthLengthDisplay(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): number {
  return monthLengthFrom(bengaliYear, monthIndex, (by, mi) => findBengaliMonthStartDisplay(by, mi, loc, system));
}

function datesFrom(start: CalendarDate, length: number): CalendarDate[] {
  const dates: CalendarDate[] = [];
  let cursor = start;
  for (let i = 0; i < length; i++) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

/**
 * All Gregorian dates belonging to a given Bengali month, in order.
 * Internal convention -- used to build the tithi resolver's per-year day
 * list (dayInfo.ts). Not for calendar-grid rendering; use
 * getBengaliMonthDatesDisplay for that.
 */
export function getBengaliMonthDates(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): CalendarDate[] {
  const start = findBengaliMonthStart(bengaliYear, monthIndex, loc, system);
  const length = bengaliMonthLength(bengaliYear, monthIndex, loc, system);
  return datesFrom(start, length);
}

/**
 * Same as getBengaliMonthDates, but using the display-corrected drik
 * sankranti boundary. Use this for rendering the Bengali-mode calendar
 * grid, so the month a user navigates to actually contains the days its
 * own header claims.
 */
export function getBengaliMonthDatesDisplay(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): CalendarDate[] {
  const start = findBengaliMonthStartDisplay(bengaliYear, monthIndex, loc, system);
  const length = bengaliMonthLengthDisplay(bengaliYear, monthIndex, loc, system);
  return datesFrom(start, length);
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
