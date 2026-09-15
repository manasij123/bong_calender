// High-level, cached API that ties the astronomy engine, Bengali calendar
// conversion, panchang, and festival/holiday data together into what a UI
// actually needs: month grids annotated with everything relevant per day.

import { CalendarDate, dateKey, getGregorianMonthDates, toBengaliDateDisplay } from "./bengaliCalendar.js";
import { getBengaliMonthDatesDisplay } from "./bengaliCalendar.js";
import { computeDayInfo, computeBengaliYearDays, DayInfo } from "./dayInfo.js";
import {
  getEventIndexForGregorianYear,
  ResolvedEvent,
  resolveBengaliFestivals,
  buildEventIndex,
} from "./festivals.js";
import { GeoLocation, KOLKATA } from "./solarTime.js";
import { getKalamWindows, getAuspiciousHints } from "./muhurat.js";
import { getShuvoKarmoForYear, ShuvoKarmoResult } from "./shuvoKarmo.js";
import { PanchangSystem } from "./suryaSiddhanta.js";

const DEFAULT_SYSTEM: PanchangSystem = "surya-siddhanta";

const dayInfoCache = new Map<string, DayInfo>();
const yearDaysCache = new Map<string, DayInfo[]>();
const eventIndexCache = new Map<string, Map<string, ResolvedEvent[]>>();
const shuvoKarmoCache = new Map<string, Map<string, ShuvoKarmoResult>>();

function locKey(loc: GeoLocation): string {
  return `${loc.latitudeDeg},${loc.longitudeDeg},${loc.timezoneOffsetHours}`;
}

export function getDayInfoCached(
  date: CalendarDate,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): DayInfo {
  const key = `${dateKey(date)}|${locKey(loc)}|${system}`;
  let info = dayInfoCache.get(key);
  if (!info) {
    info = computeDayInfo(date, loc, system);
    dayInfoCache.set(key, info);
  }
  return info;
}

export function getBengaliYearDaysCached(
  bengaliYear: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): DayInfo[] {
  const key = `${bengaliYear}|${locKey(loc)}|${system}`;
  let days = yearDaysCache.get(key);
  if (!days) {
    days = computeBengaliYearDays(bengaliYear, loc, system);
    yearDaysCache.set(key, days);
    for (const d of days) {
      dayInfoCache.set(`${dateKey(d.gregorian)}|${locKey(loc)}|${system}`, d);
    }
  }
  return days;
}

function getGregorianYearEventIndexCached(
  gregorianYear: number,
  loc: GeoLocation,
  system: PanchangSystem = DEFAULT_SYSTEM
): Map<string, ResolvedEvent[]> {
  const key = `${gregorianYear}|${locKey(loc)}|${system}`;
  let idx = eventIndexCache.get(key);
  if (!idx) {
    idx = getEventIndexForGregorianYear(
      gregorianYear,
      (by) => getBengaliYearDaysCached(by, loc, system),
      loc,
      system
    );
    eventIndexCache.set(key, idx);
  }
  return idx;
}

export interface DayCell {
  date: CalendarDate;
  info: DayInfo;
  events: ResolvedEvent[];
}

/** Full detail for a single day: panchang, Bengali date, events, kalam windows, hints. */
export interface DayDetail extends DayCell {
  kalam: ReturnType<typeof getKalamWindows>;
  auspicious: ReturnType<typeof getAuspiciousHints>;
}

export function getEventsForDate(
  date: CalendarDate,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): ResolvedEvent[] {
  const idx = getGregorianYearEventIndexCached(date.year, loc, system);
  return idx.get(dateKey(date)) ?? [];
}

/** Every festival/holiday occurrence within a Gregorian year, for building a search index. */
export function getFestivalEventsForYear(
  gregorianYear: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): ResolvedEvent[] {
  const idx = getGregorianYearEventIndexCached(gregorianYear, loc, system);
  return Array.from(idx.values()).flat();
}

export function getDayDetail(
  date: CalendarDate,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): DayDetail {
  const info = getDayInfoCached(date, loc, system);
  const events = getEventsForDate(date, loc, system);
  const kalam = getKalamWindows(info.sunTimes, info.bengali.weekday);
  const auspicious = getAuspiciousHints(info.panchang.tithi);
  return { date, info, events, kalam, auspicious };
}

/** Gregorian-calendar-primary month grid (for the "English" toggle view). */
export function getGregorianMonthGrid(
  year: number,
  month: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): DayCell[] {
  return getGregorianMonthDates(year, month).map((date) => ({
    date,
    info: getDayInfoCached(date, loc, system),
    events: getEventsForDate(date, loc, system),
  }));
}

/** Bengali-calendar-primary month grid (for the "Bangla" toggle view). */
export function getBengaliMonthGrid(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): DayCell[] {
  return getBengaliMonthDatesDisplay(bengaliYear, monthIndex, loc, system).map((date) => ({
    date,
    info: getDayInfoCached(date, loc, system),
    events: getEventsForDate(date, loc, system),
  }));
}

function getShuvoKarmoForBengaliYearCached(
  bengaliYear: number,
  loc: GeoLocation,
  system: PanchangSystem
): Map<string, ShuvoKarmoResult> {
  const key = `${bengaliYear}|${locKey(loc)}|${system}`;
  let m = shuvoKarmoCache.get(key);
  if (!m) {
    m = getShuvoKarmoForYear(getBengaliYearDaysCached(bengaliYear, loc, system));
    shuvoKarmoCache.set(key, m);
  }
  return m;
}

/**
 * Shuvo-karmo (auspicious ceremony) flags for a set of dates, e.g. the
 * dates currently shown in a month grid. Merges across however many
 * distinct Bengali years the dates span (usually one, sometimes two near
 * a Poila Boishakh boundary).
 */
export function getShuvoKarmoForDates(
  dates: CalendarDate[],
  loc: GeoLocation = KOLKATA,
  system: PanchangSystem = DEFAULT_SYSTEM
): Map<string, ShuvoKarmoResult> {
  const bengaliYears = new Set<number>();
  for (const d of dates) bengaliYears.add(toBengaliDateDisplay(d, loc, system).year);

  const merged = new Map<string, ShuvoKarmoResult>();
  for (const by of bengaliYears) {
    const m = getShuvoKarmoForBengaliYearCached(by, loc, system);
    for (const [k, v] of m) merged.set(k, v);
  }
  return merged;
}

export { KOLKATA };
export type { GeoLocation };
