// Panchang (five limbs of the day): tithi, nakshatra, yoga, karana.
// Standard definitions used across Hindu/Bengali panjikas.

import { jdToJDE, jdeCentury, pMod, rad2deg } from "./julian.js";
import { sunApparentLongitude } from "./sun.js";
import { moonPosition } from "./moon.js";
import { lahiriAyanamsaDeg } from "./ayanamsa.js";
import {
  PanchangSystem,
  suryaSiddhantaSunSiderealLongitudeDeg,
  suryaSiddhantaMoonSiderealLongitudeDeg,
} from "./suryaSiddhanta.js";

export interface Longitudes {
  /** Tropical (apparent) longitude of Sun, degrees 0..360. */
  sunTropical: number;
  /** Tropical (apparent) longitude of Moon, degrees 0..360. */
  moonTropical: number;
  /** Sidereal longitude of Sun (Lahiri in "drik", classical in "surya-siddhanta"), degrees 0..360. */
  sunSidereal: number;
  /** Sidereal longitude of Moon (Lahiri in "drik", classical in "surya-siddhanta"), degrees 0..360. */
  moonSidereal: number;
}

/**
 * Compute Sun & Moon tropical/sidereal ecliptic longitudes for a UT Julian
 * Day, under either the modern precise ("drik") or classical mean-motion
 * ("surya-siddhanta") system. The classical system is natively sidereal,
 * so its "tropical" fields here are just aliased to the sidereal ones --
 * harmless, since every consumer (tithi, karana) only ever uses the
 * Sun-Moon *difference*, which an ayanamsa-like shift cancels out of.
 */
export function longitudesAt(jd: number, system: PanchangSystem = "surya-siddhanta"): Longitudes {
  if (system === "surya-siddhanta") {
    const sunSidereal = suryaSiddhantaSunSiderealLongitudeDeg(jd);
    const moonSidereal = suryaSiddhantaMoonSiderealLongitudeDeg(jd);
    return { sunTropical: sunSidereal, moonTropical: moonSidereal, sunSidereal, moonSidereal };
  }
  const jde = jdToJDE(jd);
  const T = jdeCentury(jde);
  const sunLng = pMod(rad2deg(sunApparentLongitude(T)), 360);
  const moonLng = pMod(rad2deg(moonPosition(T).longitude), 360);
  const ayanamsa = lahiriAyanamsaDeg(jd);
  return {
    sunTropical: sunLng,
    moonTropical: moonLng,
    sunSidereal: pMod(sunLng - ayanamsa, 360),
    moonSidereal: pMod(moonLng - ayanamsa, 360),
  };
}

export const TITHI_NAMES_SHUKLA = [
  "প্রতিপদ",
  "দ্বিতীয়া",
  "তৃতীয়া",
  "চতুর্থী",
  "পঞ্চমী",
  "ষষ্ঠী",
  "সপ্তমী",
  "অষ্টমী",
  "নবমী",
  "দশমী",
  "একাদশী",
  "দ্বাদশী",
  "ত্রয়োদশী",
  "চতুর্দশী",
  "পূর্ণিমা",
];
export const TITHI_NAMES_KRISHNA = [
  "প্রতিপদ",
  "দ্বিতীয়া",
  "তৃতীয়া",
  "চতুর্থী",
  "পঞ্চমী",
  "ষষ্ঠী",
  "সপ্তমী",
  "অষ্টমী",
  "নবমী",
  "দশমী",
  "একাদশী",
  "দ্বাদশী",
  "ত্রয়োদশী",
  "চতুর্দশী",
  "অমাবস্যা",
];

export interface TithiInfo {
  /** 1-30, absolute tithi number within the lunar month. */
  number: number;
  /** 1-15, position within its paksha. */
  index: number;
  paksha: "shukla" | "krishna";
  name: string;
  /** 0..1, fraction of the way through this tithi (for reference only). */
  fraction: number;
}

export function getTithi(long: Longitudes): TithiInfo {
  const diff = pMod(long.moonTropical - long.sunTropical, 360);
  const number = Math.floor(diff / 12) + 1; // 1..30
  const fraction = (diff % 12) / 12;
  const paksha: "shukla" | "krishna" = number <= 15 ? "shukla" : "krishna";
  const index = paksha === "shukla" ? number : number - 15;
  const name = paksha === "shukla" ? TITHI_NAMES_SHUKLA[index - 1] : TITHI_NAMES_KRISHNA[index - 1];
  return { number, index, paksha, name, fraction };
}

export const NAKSHATRA_NAMES = [
  "অশ্বিনী",
  "ভরণী",
  "কৃত্তিকা",
  "রোহিণী",
  "মৃগশিরা",
  "আর্দ্রা",
  "পুনর্বসু",
  "পুষ্যা",
  "অশ্লেষা",
  "মঘা",
  "পূর্বফাল্গুনী",
  "উত্তরফাল্গুনী",
  "হস্তা",
  "চিত্রা",
  "স্বাতী",
  "বিশাখা",
  "অনুরাধা",
  "জ্যেষ্ঠা",
  "মূলা",
  "পূর্বাষাঢ়া",
  "উত্তরাষাঢ়া",
  "শ্রবণা",
  "ধনিষ্ঠা",
  "শতভিষা",
  "পূর্বভাদ্রপদ",
  "উত্তরভাদ্রপদ",
  "রেবতী",
];

export interface NakshatraInfo {
  index: number; // 0..26
  name: string;
  pada: number; // 1..4
}

export function getNakshatra(long: Longitudes): NakshatraInfo {
  const span = 360 / 27;
  const pos = long.moonSidereal;
  const index = Math.floor(pos / span);
  const withinSpan = pos - index * span;
  const pada = Math.floor(withinSpan / (span / 4)) + 1;
  return { index, name: NAKSHATRA_NAMES[index], pada };
}

export const YOGA_NAMES = [
  "বিষ্কম্ভ",
  "প্রীতি",
  "আয়ুষ্মান",
  "সৌভাগ্য",
  "শোভন",
  "অতিগণ্ড",
  "সুকর্মা",
  "ধৃতি",
  "শূল",
  "গণ্ড",
  "বৃদ্ধি",
  "ধ্রুব",
  "ব্যাঘাত",
  "হর্ষণ",
  "বজ্র",
  "সিদ্ধি",
  "ব্যতীপাত",
  "বরীয়ান",
  "পরিঘ",
  "শিব",
  "সিদ্ধ",
  "সাধ্য",
  "শুভ",
  "শুক্ল",
  "ব্রহ্ম",
  "ঐন্দ্র",
  "বৈধৃতি",
];

export interface YogaInfo {
  index: number; // 0..26
  name: string;
}

export function getYoga(long: Longitudes): YogaInfo {
  const span = 360 / 27;
  const sum = pMod(long.sunSidereal + long.moonSidereal, 360);
  const index = Math.floor(sum / span);
  return { index, name: YOGA_NAMES[index] };
}

const KARANA_MOVABLE = ["বব", "বালব", "কৌলব", "তৈতিল", "গর", "বণিজ", "বিষ্টি"];
const KARANA_FIXED: Record<number, string> = {
  1: "কিংস্তুঘ্ন",
  58: "শকুনি",
  59: "চতুষ্পদ",
  60: "নাগ",
};

export interface KaranaInfo {
  number: number; // 1..60
  name: string;
}

export function getKarana(long: Longitudes): KaranaInfo {
  const diff = pMod(long.moonTropical - long.sunTropical, 360);
  const number = Math.floor(diff / 6) + 1; // 1..60
  if (KARANA_FIXED[number]) {
    return { number, name: KARANA_FIXED[number] };
  }
  const movableIndex = (number - 2) % 7;
  return { number, name: KARANA_MOVABLE[movableIndex] };
}

export interface PanchangSummary {
  longitudes: Longitudes;
  tithi: TithiInfo;
  nakshatra: NakshatraInfo;
  yoga: YogaInfo;
  karana: KaranaInfo;
}

/** Full panchang for a given UT Julian Day moment. */
export function getPanchang(jd: number, system: PanchangSystem = "surya-siddhanta"): PanchangSummary {
  const longitudes = longitudesAt(jd, system);
  return {
    longitudes,
    tithi: getTithi(longitudes),
    nakshatra: getNakshatra(longitudes),
    yoga: getYoga(longitudes),
    karana: getKarana(longitudes),
  };
}
