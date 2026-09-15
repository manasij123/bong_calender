// Plain-Node regression test (no framework/dependency) for the drik
// sankranti display correction. Run via `npm test` after `npm run build`.
//
// These specific dates are direct APK ("Bong Calendar") Day Detail
// header observations, not inferred from a festival date or day count:
//   Poush 1, 1432  = 17 Dec 2025
//   Magh 1, 1432   = 16 Jan 2026
//   Bhadra 1, 1433 = 19 Aug 2026
//   Ashwin 1, 1433 = 18 Sep 2026
//   Vishwakarma Puja (drik) = 17 Sep 2026 (30 Bhadra)
// Everything else here guards against regressing the separation this
// correction depends on: tithi-based festivals must stay on the
// unmodified internal Bengali-month convention regardless of this
// display-only correction.

import assert from "node:assert/strict";
import * as m from "../dist/index.js";

const KOLKATA = m.KOLKATA;
let passed = 0;

function check(label, actual, expected) {
  assert.equal(actual, expected, `${label}: expected ${expected}, got ${actual}`);
  passed++;
  console.log(`  ok - ${label}`);
}

function fmt(d) {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

function monthStart(days, monthIndex) {
  const d = days.find((x) => x.displayBengali.monthIndex === monthIndex && x.displayBengali.day === 1);
  return fmt(d.gregorian);
}

console.log("A: APK-confirmed drik solar-boundary anchors");
{
  const days1432 = m.getBengaliYearDaysCached(1432, KOLKATA, "drik");
  const days1433 = m.getBengaliYearDaysCached(1433, KOLKATA, "drik");
  check("Poush 1, 1432 (drik)", monthStart(days1432, 8), "2025-12-17");
  check("Magh 1, 1432 (drik)", monthStart(days1432, 9), "2026-01-16");
  check("Bhadra 1, 1433 (drik)", monthStart(days1433, 4), "2026-08-19");
  check("Ashwin 1, 1433 (drik)", monthStart(days1433, 5), "2026-09-18");
}

console.log("B: 2026 drik Vishwakarma Puja (bengaliMonthLastDay, unchanged rule)");
{
  const days1433 = m.getBengaliYearDaysCached(1433, KOLKATA, "drik");
  const events = m.resolveBengaliFestivals(1433, days1433, "drik");
  const vk = events.find((e) => e.festival.id === "vishwakarma-puja");
  check("Vishwakarma Puja (drik)", fmt(vk.date), "2026-09-17");
  const vkRule = m.BENGALI_FESTIVALS.find((f) => f.id === "vishwakarma-puja").rule;
  check("Vishwakarma rule kind (must stay bengaliMonthLastDay)", vkRule.kind, "bengaliMonthLastDay");
}

console.log("C: surya-siddhanta completely unaffected by the drik display correction");
{
  const days1433 = m.getBengaliYearDaysCached(1433, KOLKATA, "surya-siddhanta");
  check("Bhadra 1, 1433 (surya-siddhanta)", monthStart(days1433, 4), "2026-08-19");
  const events = m.resolveBengaliFestivals(1433, days1433, "surya-siddhanta");
  const vk = events.find((e) => e.festival.id === "vishwakarma-puja");
  check("Vishwakarma Puja (surya-siddhanta)", fmt(vk.date), "2026-09-18");
  const sample = days1433.find((d) => d.gregorian.month === 9 && d.gregorian.day === 17);
  check("displayBengali === bengali for surya-siddhanta", sample.displayBengali.day === sample.bengali.day, true);
}

console.log("D: tithi-based festivals stay on the unmodified internal convention (drik)");
{
  const events2026 = m.getFestivalEventsForYear(2026, KOLKATA, "drik");
  function dateOf(id) {
    const e = events2026.find((x) => x.festival.id === id);
    return e ? fmt(e.date) : "MISSING";
  }
  check("Janmashtami 2026 (drik)", dateOf("janmashtami"), "2026-09-04");
  check("Saraswati Puja 2026 (drik)", dateOf("saraswati-puja"), "2026-01-23");
  check("Mahalaya 2026 (drik)", dateOf("mahalaya"), "2026-10-10");
  check("Maha Shashthi 2026 (drik)", dateOf("maha-shashthi"), "2026-10-16");
  check("Vijaya Dashami 2026 (drik)", dateOf("vijaya-dashami"), "2026-10-21");
}

console.log(`\n${passed} checks passed.`);
