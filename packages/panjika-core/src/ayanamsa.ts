// Lahiri (Chitrapaksha) ayanamsa - the precession offset used by
// traditional Indian/Bengali sidereal panchang calculations.
// Formula: A(Y) = 22°27'37" + 50.30"*(Y-1900) - 0.03"*(Y-1900)^2
// (N.C. Lahiri's polynomial, as adopted by the Indian Astronomical Ephemeris).

import { jdToCalendar } from "./julian.js";

const BASE_DEG = 22 + 27 / 60 + 37 / 3600;
const RATE_DEG_PER_YEAR = 50.3 / 3600;
const QUADRATIC_DEG = 0.03 / 3600;

export function decimalYear(jd: number): number {
  const cal = jdToCalendar(jd);
  return cal.year + (cal.month - 0.5) / 12;
}

/** Lahiri ayanamsa in degrees for a given (UT) Julian Day. */
export function lahiriAyanamsaDeg(jd: number): number {
  const y = decimalYear(jd) - 1900;
  return BASE_DEG + RATE_DEG_PER_YEAR * y - QUADRATIC_DEG * y * y;
}
