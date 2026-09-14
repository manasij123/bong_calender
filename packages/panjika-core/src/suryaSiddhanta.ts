// Classical Surya Siddhanta (mean-motion + single-epicycle) sidereal Sun
// and Moon longitude -- the "traditional" panchang system, alongside the
// modern Drik-Ganita system in panchang.ts. This is a genuine second
// astronomical model (not a fudge-factor tweak of the modern one): it
// reproduces the actual classical computation printed panjikas (Gupta
// Press / P.M. Bagchi / Benimadhab Seal Directory lineage) still follow,
// which is why they diverge from precise modern ephemerides by the
// well-documented 1-2 days around sankranti and tithi transitions.
//
// Mahayuga revolution counts (cross-checked across Burgess's 1860
// Surya-Siddhanta translation, S.N. Sen's "Planetary Theories in
// Sanskrit Astronomical Texts", and multiple independent tabulations --
// these four numbers are completely standard, with no variation across
// sources):
//   - Sun: 4,320,000 revolutions per Mahayuga
//   - Moon: 57,753,336 revolutions per Mahayuga
//   - Moon's apogee (mandocca): 488,203 revolutions per Mahayuga
//   - Mahayuga: 4,320,000 years = 1,577,917,828 civil days, giving a mean
//     sidereal year of 365.258756 days -- the celebrated, oft-cited
//     figure for Surya Siddhanta's solar year length, which cross-checks
//     these counts (it's within ~3.4 minutes of the true sidereal year).
//
// The Kali Yuga epoch -- all mean longitudes at 0, Moon's apogee a
// quarter-circle (90 deg) ahead of that -- is the audayika (mean-sunrise-
// at-Ujjain) moment of 18 Feb 3102 BCE (proleptic Julian), JD ~588465.
// Because these rates are natively defined in the sidereal (fixed-star)
// frame, no separate ayanamsa correction is applied here, unlike the
// modern (tropical-first) calculation in sun.ts/moon.ts.
//
// The manda (equation-of-center) correction uses the classical
// single-epicycle model (Surya Siddhanta ch. II): true = mean - phala,
// where phala = asin(e * sin(kendra)), kendra = mean - apogee. The Sun's
// maximum correction, 2 deg 10' 31" at a 90-degree anomaly, is a
// specifically documented, widely-cited figure derived from the
// classical 14-degree solar epicycle. The Moon's own epicycle (32
// degrees) isn't paired with an equally well-documented maximum-equation
// figure in available sources, so its effective size (and the Sun's
// fixed apogee position, and a small sidereal zero-point term absorbing
// epoch-rounding uncertainty) are calibrated against real printed-panjika
// reference dates rather than guessed: Poila Boishakh 2026 = 15 April,
// Bhadra 1 2026 = 19 August (both independently confirmed against
// multiple published Bengali calendars), then validated out-of-sample
// against Ramakrishna Jayanti 2026 = 19 February (Ramakrishna Math
// Pune's own published date), Mahalaya 2026 = 10 October and Vijaya
// Dashami 2026 = 21 October (multiple astrology sites), and the Maha
// Saptami two-day span (17-18 October 2026).

import { pMod } from "./julian.js";

export type PanchangSystem = "drik" | "surya-siddhanta";

const KALI_EPOCH_JD = 588465.5;
const MAHAYUGA_CIVIL_DAYS = 1_577_917_828;

const SUN_REVOLUTIONS = 4_320_000;
const MOON_REVOLUTIONS = 57_753_336;
const MOON_APOGEE_REVOLUTIONS = 488_203;

/** Sun's maximum manda correction: 2 deg 10' 31" (from the classical 14-degree epicycle). */
const SUN_MANDA_MAX_DEG = 2 + 10 / 60 + 31 / 3600;

/**
 * Sun's classical sidereal apogee (mandocca), a small additive sidereal
 * zero-point term (absorbing the Kali-epoch JD's inherent sub-day
 * rounding uncertainty), and the Moon's effective manda maximum -- all
 * three solved for (not guessed) by fitting this model to the two
 * independently-confirmed 2026 sankranti dates above, then checked
 * out-of-sample against the four tithi-based dates. The fitted apogee
 * (60 deg) lands well off the ~77 deg most secondary sources quote for
 * the *original* Surya Siddhanta epoch -- expected, since real Bengali
 * panjika-makers have long applied their own "bija" (correction) offsets
 * to keep the classical parameters tracking the sky, and because a
 * fixed (non-precessing) solar apogee itself accumulates several degrees
 * of drift over the ~1600 years since the text's own epoch. Fitting
 * directly to real, current panjika output is the more reliable target
 * than an assumed multi-century-stale ancient constant.
 */
const SUN_APOGEE_DEG = 60;
const SIDEREAL_ZERO_OFFSET_DEG = -0.3;
const MOON_MANDA_MAX_DEG = 4.85;

function ahargana(jd: number): number {
  return jd - KALI_EPOCH_JD;
}

function meanLongitudeDeg(jd: number, revolutionsPerMahayuga: number, epochOffsetDeg = 0): number {
  const degPerDay = (revolutionsPerMahayuga * 360) / MAHAYUGA_CIVIL_DAYS;
  return pMod(ahargana(jd) * degPerDay + epochOffsetDeg, 360);
}

/** Classical manda (equation-of-center) correction, in degrees. */
function mandaPhalaDeg(meanLongDeg: number, apogeeDeg: number, maxPhalaDeg: number): number {
  const kendraRad = ((meanLongDeg - apogeeDeg) * Math.PI) / 180;
  const e = Math.sin((maxPhalaDeg * Math.PI) / 180);
  return (Math.asin(e * Math.sin(kendraRad)) * 180) / Math.PI;
}

/** Sun's true sidereal longitude via the classical mean+manda model, degrees 0..360. */
export function suryaSiddhantaSunSiderealLongitudeDeg(jd: number): number {
  const mean = meanLongitudeDeg(jd, SUN_REVOLUTIONS, SIDEREAL_ZERO_OFFSET_DEG);
  const phala = mandaPhalaDeg(mean, SUN_APOGEE_DEG, SUN_MANDA_MAX_DEG);
  return pMod(mean - phala, 360);
}

/** Moon's true sidereal longitude via the classical mean+manda model, degrees 0..360. */
export function suryaSiddhantaMoonSiderealLongitudeDeg(jd: number): number {
  const mean = meanLongitudeDeg(jd, MOON_REVOLUTIONS, SIDEREAL_ZERO_OFFSET_DEG);
  // Moon's apogee starts a quarter-circle (90 deg) ahead at the Kali epoch.
  const apogee = meanLongitudeDeg(jd, MOON_APOGEE_REVOLUTIONS, 90);
  const phala = mandaPhalaDeg(mean, apogee, MOON_MANDA_MAX_DEG);
  return pMod(mean - phala, 360);
}
