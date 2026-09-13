// Julian Day + Delta-T utilities.
// Formulas follow Jean Meeus, "Astronomical Algorithms" (2nd ed.), chapters 7 & 10,
// cross-checked against the MIT-licensed MeeusJs reference implementation
// (https://github.com/Fabiz/MeeusJs).

export const J2000 = 2451545.0;
export const JULIAN_CENTURY = 36525;

export function pMod(a: number, b: number): number {
  const c = a % b;
  return c < 0 ? c + b : c;
}

/** Gregorian calendar date (UTC) -> Julian Day number. */
export function gregorianToJD(year: number, month: number, day: number): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return (
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5
  );
}

/** JS Date (any timezone) -> Julian Day (UTC-based). */
export function dateToJD(date: Date): number {
  const day =
    date.getUTCDate() +
    (date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds()) / 86400;
  return gregorianToJD(date.getUTCFullYear(), date.getUTCMonth() + 1, day);
}

/** Julian Day -> JS Date (UTC). */
export function jdToDate(jd: number): Date {
  const cal = jdToCalendar(jd);
  const dayFrac = cal.day - Math.floor(cal.day);
  const totalSeconds = Math.round(dayFrac * 86400);
  return new Date(
    Date.UTC(
      cal.year,
      cal.month - 1,
      Math.floor(cal.day),
      Math.floor(totalSeconds / 3600) % 24,
      Math.floor(totalSeconds / 60) % 60,
      totalSeconds % 60
    )
  );
}

export function jdToCalendar(jd: number): { year: number; month: number; day: number } {
  const jdShifted = jd + 0.5;
  const z = Math.floor(jdShifted);
  const f = jdShifted - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  return { year, month, day };
}

/**
 * Delta-T (TT - UT) estimate in seconds, piecewise polynomial approximation
 * (Espenak & Meeus). Good to within a couple of seconds for 1900-2100.
 */
export function estimateDeltaT(jd: number): number {
  const cal = jdToCalendar(jd);
  const y = cal.year + (cal.month - 0.5) / 12;
  const u = (y - 1820) / 100;

  if (y < 1900) {
    const t = (y - 1900) / 100;
    return (
      -2.79 +
      1.494119 * t -
      0.0598939 * t ** 2 +
      0.0061966 * t ** 3 -
      0.000197 * t ** 4
    );
  }
  if (y < 1920) {
    const t = (y - 1900) / 100;
    return (
      -2.79 +
      1.494119 * t -
      0.0598939 * t ** 2 +
      0.0061966 * t ** 3 -
      0.000197 * t ** 4
    );
  }
  if (y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
  }
  if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
  }
  if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
  }
  if (y < 2005) {
    const t = y - 2000;
    return (
      63.86 +
      0.3345 * t -
      0.060374 * t ** 2 +
      0.0017275 * t ** 3 +
      0.000651814 * t ** 4 +
      0.00002373599 * t ** 5
    );
  }
  if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
  }
  if (y < 2150) {
    return -20 + 32 * u ** 2 - 0.5628 * (2150 - y);
  }
  return -20 + 32 * u ** 2;
}

/** UT Julian Day -> Julian Ephemeris Day (dynamical time). */
export function jdToJDE(jd: number): number {
  return jd + estimateDeltaT(jd) / 86400;
}

/** Julian centuries since J2000.0, from a JDE. */
export function jdeCentury(jde: number): number {
  return (jde - J2000) / JULIAN_CENTURY;
}

export function horner(x: number, coeffs: number[]): number {
  let result = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    result = result * x + coeffs[i];
  }
  return result;
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
export function deg2rad(d: number): number {
  return d * DEG2RAD;
}
export function rad2deg(r: number): number {
  return r * RAD2DEG;
}
