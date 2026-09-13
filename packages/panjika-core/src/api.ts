// High-level, cached API that ties the astronomy engine, Bengali calendar
// conversion, panchang, and festival/holiday data together into what a UI
// actually needs: month grids annotated with everything relevant per day.

import { CalendarDate, dateKey, getGregorianMonthDates } from "./bengaliCalendar.js";
import { getBengaliMonthDates } from "./bengaliCalendar.js";
import { computeDayInfo, computeBengaliYearDays, DayInfo } from "./dayInfo.js";
import {
  getEventIndexForGregorianYear,
  ResolvedEvent,
  resolveBengaliFestivals,
  buildEventIndex,
} from "./festivals.js";
import { GeoLocation, KOLKATA } from "./solarTime.js";
import { getKalamWindows, getAuspiciousHints } from "./muhurat.js";

const dayInfoCache = new Map<string, DayInfo>();
const yearDaysCache = new Map<string, DayInfo[]>();
const eventIndexCache = new Map<string, Map<string, ResolvedEvent[]>>();

function locKey(loc: GeoLocation): string {
  return `${loc.latitudeDeg},${loc.longitudeDeg},${loc.timezoneOffsetHours}`;
}

export function getDayInfoCached(date: CalendarDate, loc: GeoLocation = KOLKATA): DayInfo {
  const key = `${dateKey(date)}|${locKey(loc)}`;
  let info = dayInfoCache.get(key);
  if (!info) {
    info = computeDayInfo(date, loc);
    dayInfoCache.set(key, info);
  }
  return info;
}

export function getBengaliYearDaysCached(bengaliYear: number, loc: GeoLocation = KOLKATA): DayInfo[] {
  const key = `${bengaliYear}|${locKey(loc)}`;
  let days = yearDaysCache.get(key);
  if (!days) {
    days = computeBengaliYearDays(bengaliYear, loc);
    yearDaysCache.set(key, days);
    for (const d of days) {
      dayInfoCache.set(`${dateKey(d.gregorian)}|${locKey(loc)}`, d);
    }
  }
  return days;
}

function getGregorianYearEventIndexCached(
  gregorianYear: number,
  loc: GeoLocation
): Map<string, ResolvedEvent[]> {
  const key = `${gregorianYear}|${locKey(loc)}`;
  let idx = eventIndexCache.get(key);
  if (!idx) {
    idx = getEventIndexForGregorianYear(gregorianYear, (by) => getBengaliYearDaysCached(by, loc), loc);
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

export function getEventsForDate(date: CalendarDate, loc: GeoLocation = KOLKATA): ResolvedEvent[] {
  const idx = getGregorianYearEventIndexCached(date.year, loc);
  return idx.get(dateKey(date)) ?? [];
}

/** Every festival/holiday occurrence within a Gregorian year, for building a search index. */
export function getFestivalEventsForYear(gregorianYear: number, loc: GeoLocation = KOLKATA): ResolvedEvent[] {
  const idx = getGregorianYearEventIndexCached(gregorianYear, loc);
  return Array.from(idx.values()).flat();
}

export function getDayDetail(date: CalendarDate, loc: GeoLocation = KOLKATA): DayDetail {
  const info = getDayInfoCached(date, loc);
  const events = getEventsForDate(date, loc);
  const kalam = getKalamWindows(info.sunTimes, info.bengali.weekday);
  const auspicious = getAuspiciousHints(info.panchang.tithi);
  return { date, info, events, kalam, auspicious };
}

/** Gregorian-calendar-primary month grid (for the "English" toggle view). */
export function getGregorianMonthGrid(
  year: number,
  month: number,
  loc: GeoLocation = KOLKATA
): DayCell[] {
  return getGregorianMonthDates(year, month).map((date) => ({
    date,
    info: getDayInfoCached(date, loc),
    events: getEventsForDate(date, loc),
  }));
}

/** Bengali-calendar-primary month grid (for the "Bangla" toggle view). */
export function getBengaliMonthGrid(
  bengaliYear: number,
  monthIndex: number,
  loc: GeoLocation = KOLKATA
): DayCell[] {
  return getBengaliMonthDates(bengaliYear, monthIndex, loc).map((date) => ({
    date,
    info: getDayInfoCached(date, loc),
    events: getEventsForDate(date, loc),
  }));
}

export { KOLKATA };
export type { GeoLocation };
