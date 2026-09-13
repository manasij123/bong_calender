// Sunrise / sunset / solar noon, using the standard NOAA-style
// approximation (equation of time + hour angle). Accurate to roughly
// +/-1 minute, which is sufficient for panchang / muhurat display.

import { gregorianToJD, horner, jdToJDE, jdeCentury, pMod } from "./julian.js";
import { sunMeanAnomaly, sunMeanLongitude, sunApparentLongitude } from "./sun.js";

export interface GeoLocation {
  latitudeDeg: number;
  longitudeDeg: number; // positive East
  timezoneOffsetHours: number; // e.g. 5.5 for IST
}

export const KOLKATA: GeoLocation = {
  latitudeDeg: 22.5726,
  longitudeDeg: 88.3639,
  timezoneOffsetHours: 5.5,
};

function meanObliquityDeg(T: number): number {
  return horner(T, [23.4392911, -0.0130042, -0.00000016, 0.000000504]);
}

/** Equation of time in minutes, Meeus ch. 28 (low precision). */
function equationOfTimeMinutes(T: number): number {
  const epsilon = (meanObliquityDeg(T) * Math.PI) / 180;
  const y = Math.tan(epsilon / 2) ** 2;
  const L0 = sunMeanLongitude(T); // radians
  const M = sunMeanAnomaly(T); // radians
  const e = horner(T, [0.016708634, -0.000042037, -0.0000001267]);

  const E =
    y * Math.sin(2 * L0) -
    2 * e * Math.sin(M) +
    4 * e * y * Math.sin(M) * Math.cos(2 * L0) -
    0.5 * y * y * Math.sin(4 * L0) -
    1.25 * e * e * Math.sin(2 * M);

  return (4 * E * 180) / Math.PI;
}

function sunDeclinationRad(T: number): number {
  const epsilon = (meanObliquityDeg(T) * Math.PI) / 180;
  const lambda = sunApparentLongitude(T);
  return Math.asin(Math.sin(epsilon) * Math.sin(lambda));
}

export interface SunTimes {
  sunriseLocal: Date;
  sunsetLocal: Date;
  solarNoonLocal: Date;
}

const ZENITH_OFFICIAL = (90.833 * Math.PI) / 180;

/**
 * Sunrise/sunset/solar-noon for the given local calendar date (interpreted
 * in the location's fixed timezone offset) and location.
 */
export function getSunTimes(year: number, month: number, day: number, loc: GeoLocation): SunTimes {
  // Approximate JD at local noon, to get T for the equation-of-time / declination.
  const jdApproxNoonUTC = gregorianToJD(year, month, day) + (12 - loc.timezoneOffsetHours) / 24;
  const jde = jdToJDE(jdApproxNoonUTC);
  const T = jdeCentury(jde);

  const eqTimeMin = equationOfTimeMinutes(T);
  const dec = sunDeclinationRad(T);
  const latRad = (loc.latitudeDeg * Math.PI) / 180;

  const cosH0 =
    (Math.cos(ZENITH_OFFICIAL) - Math.sin(latRad) * Math.sin(dec)) /
    (Math.cos(latRad) * Math.cos(dec));
  const clamped = Math.max(-1, Math.min(1, cosH0));
  const H0deg = (Math.acos(clamped) * 180) / Math.PI;

  const solarNoonUTCHours = 12 - loc.longitudeDeg / 15 - eqTimeMin / 60;
  const sunriseUTCHours = solarNoonUTCHours - H0deg / 15;
  const sunsetUTCHours = solarNoonUTCHours + H0deg / 15;

  // utcHours is hours-of-day-`day` in UTC (can be <0 or >=24 near midnight).
  const toAbsoluteInstant = (utcHours: number) => {
    const totalMinutes = Math.round(pMod(utcHours, 24) * 60);
    const dayOffset = Math.floor(utcHours / 24);
    const base = new Date(Date.UTC(year, month - 1, day + dayOffset));
    base.setUTCMinutes(base.getUTCMinutes() + totalMinutes);
    return base;
  };

  return {
    sunriseLocal: toAbsoluteInstant(sunriseUTCHours),
    solarNoonLocal: toAbsoluteInstant(solarNoonUTCHours),
    sunsetLocal: toAbsoluteInstant(sunsetUTCHours),
  };
}
