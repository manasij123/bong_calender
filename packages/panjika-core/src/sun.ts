// Sun's apparent geocentric ecliptic longitude.
// Low-precision solar theory, Jean Meeus "Astronomical Algorithms" ch. 25
// (accurate to about 0.01 degree). Coefficients cross-checked against the
// MIT-licensed MeeusJs reference implementation.

import { deg2rad, horner, pMod } from "./julian.js";

/** Sun's mean anomaly M, in radians, from Julian centuries T (TT). */
export function sunMeanAnomaly(T: number): number {
  return deg2rad(horner(T, [357.52911, 35999.05029, -0.0001537]));
}

/** Sun's mean longitude L0, in radians. */
export function sunMeanLongitude(T: number): number {
  return deg2rad(pMod(horner(T, [280.46646, 36000.76983, 0.0003032]), 360));
}

/** Longitude of the ascending node of the Moon's mean orbit, in radians. */
export function moonNode(T: number): number {
  return deg2rad(125.04 - 1934.136 * T);
}

/** Sun's true geocentric longitude, in radians (0..2pi). */
export function sunTrueLongitude(T: number): number {
  const L0 = sunMeanLongitude(T);
  const M = sunMeanAnomaly(T);
  const C = deg2rad(
    horner(T, [1.914602, -0.004817, -0.000014]) * Math.sin(M) +
      (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
      0.000289 * Math.sin(3 * M)
  );
  return pMod(L0 + C, 2 * Math.PI);
}

/**
 * Sun's apparent geocentric ecliptic longitude, in radians (0..2pi).
 * Includes the low-precision correction for nutation + aberration.
 */
export function sunApparentLongitude(T: number): number {
  const trueLng = sunTrueLongitude(T);
  const omega = moonNode(T);
  return pMod(trueLng - deg2rad(0.00569) - deg2rad(0.00478) * Math.sin(omega), 2 * Math.PI);
}
