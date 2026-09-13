// Per-day panchang info, precomputed across a whole Bengali year so that
// festival rules (which need to scan a lunar-tithi across a solar month)
// only need one pass of astronomical calculations.

import { dateToJD } from "./julian.js";
import { getPanchang, PanchangSummary } from "./panchang.js";
import { getSunTimes, GeoLocation, KOLKATA, SunTimes } from "./solarTime.js";
import {
  BengaliDate,
  CalendarDate,
  getBengaliMonthDates,
  toBengaliDate,
} from "./bengaliCalendar.js";

export interface DayInfo {
  gregorian: CalendarDate;
  bengali: BengaliDate;
  panchang: PanchangSummary;
  sunTimes: SunTimes;
}

/** Panchang computed at this local calendar date's sunrise (traditional convention). */
export function computeDayInfo(date: CalendarDate, loc: GeoLocation = KOLKATA): DayInfo {
  const sunTimes = getSunTimes(date.year, date.month, date.day, loc);
  const jd = dateToJD(sunTimes.sunriseLocal);
  const panchang = getPanchang(jd);
  const bengali = toBengaliDate(date, loc);
  return { gregorian: date, bengali, panchang, sunTimes };
}

/** All 12 Bengali months' days for a Bengali year, each with full panchang. */
export function computeBengaliYearDays(bengaliYear: number, loc: GeoLocation = KOLKATA): DayInfo[] {
  const days: DayInfo[] = [];
  for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
    const dates = getBengaliMonthDates(bengaliYear, monthIndex, loc);
    for (const date of dates) {
      days.push(computeDayInfo(date, loc));
    }
  }
  return days;
}
