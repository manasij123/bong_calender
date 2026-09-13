// Hand-drawn artwork supplied for specific festivals/holidays, keyed by
// festival id (see packages/panjika-core/src/festivals.ts) or, for the
// three special tithis that aren't tied to a festival record, by a fixed
// pseudo-key. Falls back to the generic SVG icon set (festivalIcons.tsx)
// for anything not listed here. Multiple images for one key are shown as
// a slow auto-cycling crossfade (see CyclingImage.tsx).

const BASE = "/festival-icons";

export const FESTIVAL_IMAGES: Record<string, string[]> = {
  "poila-boishakh": [`${BASE}/poila-boishakh-1.png`, `${BASE}/poila-boishakh-2.png`],
  "rath-yatra": [`${BASE}/rath-yatra.png`],
  "ulto-rath": [`${BASE}/rath-yatra.png`],
  "guru-purnima": [`${BASE}/guru-purnima.png`],
  "jhulan-yatra": [`${BASE}/jhulan-yatra.png`],
  "rakhi-purnima": [`${BASE}/rakhi-purnima.png`],
  "janmashtami": [`${BASE}/janmashtami.png`],
  "ganesh-chaturthi": [`${BASE}/ganesh-chaturthi.png`],
  "vishwakarma-puja": [`${BASE}/vishwakarma-puja.png`],
  "mahalaya": [`${BASE}/mahalaya.png`],
  "maha-shashthi": [`${BASE}/durga-puja.png`],
  "maha-saptami": [`${BASE}/durga-puja.png`],
  "maha-ashtami": [`${BASE}/durga-puja.png`],
  "maha-nabami": [`${BASE}/durga-puja.png`],
  "vijaya-dashami": [`${BASE}/durga-puja.png`],
  "kojagari-lakshmi-puja": [`${BASE}/lakshmi.png`],
  "kali-puja": [`${BASE}/kali-puja.png`],
  "bhai-phota": [`${BASE}/bhai-phota.png`],
  "chhath-puja": [`${BASE}/chhath-puja.png`],
  "rash-purnima": [`${BASE}/rash-purnima.png`],
  "saraswati-puja": [`${BASE}/saraswati-puja.png`],
  "shivratri": [`${BASE}/shiva.png`],
  "dol-purnima": [`${BASE}/dol-purnima.png`],
  "annapurna-puja": [`${BASE}/lakshmi.png`],
  "charak-gajan": [`${BASE}/shiva.png`],

  "new-year": [`${BASE}/new-year.png`],
  "republic-day": [`${BASE}/republic-day.png`],
  "valentines-day": [`${BASE}/valentines-day.png`],
  "independence-day": [`${BASE}/independence-day.png`],
  "teachers-day": [`${BASE}/teachers-day.png`],
  "gandhi-jayanti": [`${BASE}/gandhi-jayanti.png`],
  "childrens-day": [`${BASE}/childrens-day.png`],
  "christmas-eve": [`${BASE}/christmas-eve.png`],
  "christmas": [`${BASE}/christmas.png`],
  "good-friday": [`${BASE}/good-friday.png`],
  "easter-sunday": [`${BASE}/easter-sunday.png`],
};

/** Pseudo-keys for the special-tithi badges (not tied to a Festival record). */
export const TITHI_IMAGES: Record<string, string[]> = {
  ekadashi: [`${BASE}/ekadashi.png`],
  amavasya: [`${BASE}/amavasya.png`],
};
