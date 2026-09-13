// Bengali Hindu festival rule engine. Most festivals are defined by a
// tithi (lunar day) falling within a specific Bengali solar month -- the
// same way printed panjikas derive them -- rather than hard-coded per-year
// dates, so they stay correct for any year the astronomical engine covers.
// A handful of festivals are purely solar (sankranti-based) or fixed.

import { CalendarDate, dateKey, findBengaliMonthStart, addDays } from "./bengaliCalendar.js";
import { DayInfo } from "./dayInfo.js";
import { GeoLocation, KOLKATA } from "./solarTime.js";
import { HijriDate, hijriToGregorian, gregorianToHijri } from "./hijri.js";

export type FestivalCategory = "bengali-new-year" | "puja" | "vrata" | "solar" | "other" | "islamic";

export type FestivalIconKey =
  | "durga"
  | "ganesh"
  | "saraswati"
  | "lakshmi"
  | "kali"
  | "shiva"
  | "krishna"
  | "diya"
  | "rakhi"
  | "tilak"
  | "moon-full"
  | "moon-new"
  | "sun"
  | "chariot"
  | "flag"
  | "tree"
  | "heart"
  | "dove"
  | "book"
  | "balloon"
  | "colors"
  | "gear"
  | "cross"
  | "egg"
  | "star"
  | "crescent";

export type FestivalRule =
  | { kind: "tithi"; monthIndex: number; paksha: "shukla" | "krishna"; tithiIndex: number }
  | { kind: "bengaliMonthDay"; monthIndex: number; day: number }
  | { kind: "bengaliMonthLastDay"; monthIndex: number }
  | {
      kind: "tithiNearAnchor";
      anchorId: string;
      minOffsetDays: number;
      maxOffsetDays: number;
      paksha: "shukla" | "krishna";
      tithiIndex: number;
    };

export interface Festival {
  id: string;
  nameBn: string;
  nameEn: string;
  category: FestivalCategory;
  rule: FestivalRule;
  emoji: string;
  icon: FestivalIconKey;
}

export const BENGALI_FESTIVALS: Festival[] = [
  { id: "poila-boishakh", nameBn: "পয়লা বৈশাখ (নববর্ষ)", nameEn: "Bengali New Year", category: "bengali-new-year", rule: { kind: "bengaliMonthDay", monthIndex: 0, day: 1 }, emoji: "🎊", icon: "sun" },
  { id: "rabindra-jayanti", nameBn: "রবীন্দ্র জয়ন্তী (২৫ বৈশাখ)", nameEn: "Rabindra Jayanti (Tagore's Birthday)", category: "other", rule: { kind: "bengaliMonthDay", monthIndex: 0, day: 25 }, emoji: "📖", icon: "book" },
  { id: "ramakrishna-jayanti", nameBn: "শ্রীরামকৃষ্ণের জন্মতিথি", nameEn: "Ramakrishna Jayanti", category: "other", rule: { kind: "tithi", monthIndex: 10, paksha: "shukla", tithiIndex: 2 }, emoji: "🪔", icon: "diya" },
  { id: "rath-yatra", nameBn: "রথযাত্রা", nameEn: "Rath Yatra", category: "puja", rule: { kind: "tithi", monthIndex: 2, paksha: "shukla", tithiIndex: 2 }, emoji: "🛺", icon: "chariot" },
  { id: "ulto-rath", nameBn: "উল্টো রথ", nameEn: "Ulto Rath", category: "puja", rule: { kind: "tithi", monthIndex: 2, paksha: "shukla", tithiIndex: 10 }, emoji: "🛺", icon: "chariot" },
  { id: "guru-purnima", nameBn: "গুরু পূর্ণিমা", nameEn: "Guru Purnima", category: "vrata", rule: { kind: "tithi", monthIndex: 2, paksha: "shukla", tithiIndex: 15 }, emoji: "🙏", icon: "moon-full" },
  { id: "jhulan-yatra", nameBn: "ঝুলনযাত্রা শুরু", nameEn: "Jhulan Yatra Begins", category: "puja", rule: { kind: "tithi", monthIndex: 3, paksha: "shukla", tithiIndex: 11 }, emoji: "🎐", icon: "diya" },
  { id: "rakhi-purnima", nameBn: "রাখী বন্ধন / ঝুলন পূর্ণিমা", nameEn: "Rakhi Bandhan (Raksha Bandhan)", category: "vrata", rule: { kind: "tithi", monthIndex: 3, paksha: "shukla", tithiIndex: 15 }, emoji: "🧵", icon: "rakhi" },
  { id: "janmashtami", nameBn: "জন্মাষ্টমী", nameEn: "Janmashtami", category: "puja", rule: { kind: "tithi", monthIndex: 4, paksha: "krishna", tithiIndex: 8 }, emoji: "🪈", icon: "krishna" },
  { id: "ganesh-chaturthi", nameBn: "গণেশ চতুর্থী", nameEn: "Ganesh Chaturthi", category: "puja", rule: { kind: "tithi", monthIndex: 4, paksha: "shukla", tithiIndex: 4 }, emoji: "🐘", icon: "ganesh" },
  { id: "vishwakarma-puja", nameBn: "বিশ্বকর্মা পূজা", nameEn: "Vishwakarma Puja", category: "solar", rule: { kind: "bengaliMonthLastDay", monthIndex: 4 }, emoji: "⚙️", icon: "gear" },
  { id: "mahalaya", nameBn: "মহালয়া", nameEn: "Mahalaya", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "krishna", tithiIndex: 15 }, emoji: "🪔", icon: "diya" },
  // Shashthi through Dashami are anchored to Mahalaya (rather than matched
  // by raw Bengali-month index) because in an Adhik Maas year the Devi
  // Paksha tithis can spill from Ashwin into Kartik -- searching "any
  // shukla-shashthi within Ashwin" then grabs an unrelated, much earlier
  // occurrence instead of the one that actually follows this year's
  // Mahalaya. See e.g. 2026, where Ashwin also contains a leftover shukla
  // paksha tail from Bhadra before Mahalaya even happens.
  { id: "maha-shashthi", nameBn: "মহাষষ্ঠী", nameEn: "Maha Shashthi (Durga Puja)", category: "puja", rule: { kind: "tithiNearAnchor", anchorId: "mahalaya", minOffsetDays: 1, maxOffsetDays: 20, paksha: "shukla", tithiIndex: 6 }, emoji: "🪔", icon: "durga" },
  { id: "maha-saptami", nameBn: "মহাসপ্তমী", nameEn: "Maha Saptami (Durga Puja)", category: "puja", rule: { kind: "tithiNearAnchor", anchorId: "mahalaya", minOffsetDays: 1, maxOffsetDays: 20, paksha: "shukla", tithiIndex: 7 }, emoji: "🪔", icon: "durga" },
  { id: "maha-ashtami", nameBn: "মহাষ্টমী", nameEn: "Maha Ashtami (Durga Puja)", category: "puja", rule: { kind: "tithiNearAnchor", anchorId: "mahalaya", minOffsetDays: 1, maxOffsetDays: 20, paksha: "shukla", tithiIndex: 8 }, emoji: "🪔", icon: "durga" },
  { id: "maha-nabami", nameBn: "মহানবমী", nameEn: "Maha Nabami (Durga Puja)", category: "puja", rule: { kind: "tithiNearAnchor", anchorId: "mahalaya", minOffsetDays: 1, maxOffsetDays: 20, paksha: "shukla", tithiIndex: 9 }, emoji: "🪔", icon: "durga" },
  { id: "vijaya-dashami", nameBn: "বিজয়া দশমী", nameEn: "Vijaya Dashami", category: "puja", rule: { kind: "tithiNearAnchor", anchorId: "mahalaya", minOffsetDays: 1, maxOffsetDays: 20, paksha: "shukla", tithiIndex: 10 }, emoji: "🪔", icon: "durga" },
  { id: "kojagari-lakshmi-puja", nameBn: "কোজাগরী লক্ষ্মী পূজা", nameEn: "Kojagari Lakshmi Puja", category: "puja", rule: { kind: "tithiNearAnchor", anchorId: "vijaya-dashami", minOffsetDays: 1, maxOffsetDays: 10, paksha: "shukla", tithiIndex: 15 }, emoji: "🪷", icon: "lakshmi" },
  { id: "kali-puja", nameBn: "কালীপূজা / দীপাবলি", nameEn: "Kali Puja / Diwali", category: "puja", rule: { kind: "tithi", monthIndex: 6, paksha: "krishna", tithiIndex: 15 }, emoji: "🪔", icon: "kali" },
  { id: "bhai-phota", nameBn: "ভাইফোঁটা", nameEn: "Bhai Phota (Bhai Dooj)", category: "vrata", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 2 }, emoji: "🎀", icon: "tilak" },
  { id: "chhath-puja", nameBn: "ছট পূজা", nameEn: "Chhath Puja", category: "puja", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 6 }, emoji: "🌅", icon: "sun" },
  { id: "rash-purnima", nameBn: "রাস পূর্ণিমা", nameEn: "Rash Purnima", category: "puja", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 15 }, emoji: "🪷", icon: "moon-full" },
  { id: "saraswati-puja", nameBn: "সরস্বতী পূজা (বসন্ত পঞ্চমী)", nameEn: "Saraswati Puja (Basant Panchami)", category: "puja", rule: { kind: "tithi", monthIndex: 9, paksha: "shukla", tithiIndex: 5 }, emoji: "📚", icon: "saraswati" },
  { id: "shivratri", nameBn: "শিবরাত্রি", nameEn: "Maha Shivaratri", category: "vrata", rule: { kind: "tithi", monthIndex: 10, paksha: "krishna", tithiIndex: 14 }, emoji: "🔱", icon: "shiva" },
  { id: "dol-purnima", nameBn: "দোলযাত্রা / হোলি", nameEn: "Dol Purnima / Holi", category: "puja", rule: { kind: "tithi", monthIndex: 10, paksha: "shukla", tithiIndex: 15 }, emoji: "🎨", icon: "colors" },
  { id: "annapurna-puja", nameBn: "অন্নপূর্ণা পূজা", nameEn: "Annapurna Puja", category: "puja", rule: { kind: "tithi", monthIndex: 10, paksha: "krishna", tithiIndex: 8 }, emoji: "🍚", icon: "lakshmi" },
  { id: "charak-gajan", nameBn: "চড়ক পূজা / গাজন", nameEn: "Charak Puja / Gajan", category: "solar", rule: { kind: "bengaliMonthLastDay", monthIndex: 11 }, emoji: "🔥", icon: "shiva" },
];

export const GREGORIAN_HOLIDAYS: {
  id: string;
  nameBn: string;
  nameEn: string;
  month: number;
  day: number;
  emoji: string;
  icon: FestivalIconKey;
}[] = [
  { id: "new-year", nameBn: "ইংরেজি নববর্ষ", nameEn: "New Year's Day", month: 1, day: 1, emoji: "🎉", icon: "star" },
  { id: "vivekananda-jayanti", nameBn: "স্বামী বিবেকানন্দের জন্মজয়ন্তী", nameEn: "Swami Vivekananda's Birthday", month: 1, day: 12, emoji: "🧘", icon: "diya" },
  { id: "republic-day", nameBn: "প্রজাতন্ত্র দিবস", nameEn: "Republic Day (India)", month: 1, day: 26, emoji: "🇮🇳", icon: "flag" },
  { id: "valentines-day", nameBn: "ভ্যালেন্টাইনস ডে", nameEn: "Valentine's Day", month: 2, day: 14, emoji: "❤️", icon: "heart" },
  { id: "may-day", nameBn: "মে দিবস", nameEn: "International Workers' Day", month: 5, day: 1, emoji: "🛠️", icon: "gear" },
  { id: "independence-day", nameBn: "স্বাধীনতা দিবস", nameEn: "Independence Day (India)", month: 8, day: 15, emoji: "🇮🇳", icon: "flag" },
  { id: "teachers-day", nameBn: "শিক্ষক দিবস", nameEn: "Teachers' Day", month: 9, day: 5, emoji: "🍎", icon: "book" },
  { id: "gandhi-jayanti", nameBn: "গান্ধী জয়ন্তী", nameEn: "Gandhi Jayanti", month: 10, day: 2, emoji: "🕊️", icon: "dove" },
  { id: "childrens-day", nameBn: "শিশু দিবস", nameEn: "Children's Day", month: 11, day: 14, emoji: "🎈", icon: "balloon" },
  { id: "sarada-devi-jayanti", nameBn: "সারদা দেবীর জন্মতিথি", nameEn: "Sarada Devi's Birthday", month: 12, day: 22, emoji: "🪔", icon: "diya" },
  { id: "christmas-eve", nameBn: "বড়দিনের প্রাক্কাল", nameEn: "Christmas Eve", month: 12, day: 24, emoji: "🎄", icon: "tree" },
  { id: "christmas", nameBn: "বড়দিন", nameEn: "Christmas", month: 12, day: 25, emoji: "🎄", icon: "tree" },
  { id: "new-years-eve", nameBn: "বর্ষবরণ", nameEn: "New Year's Eve", month: 12, day: 31, emoji: "🥂", icon: "star" },
];

export const ISLAMIC_HOLIDAYS: {
  id: string;
  nameBn: string;
  nameEn: string;
  hijriMonth: number;
  hijriDay: number;
  emoji: string;
  icon: FestivalIconKey;
}[] = [
  { id: "muharram", nameBn: "পয়লা মহররম (হিজরি নববর্ষ)", nameEn: "Islamic New Year (Muharram)", hijriMonth: 1, hijriDay: 1, emoji: "🌙", icon: "crescent" },
  { id: "ashura", nameBn: "আশুরা", nameEn: "Ashura", hijriMonth: 1, hijriDay: 10, emoji: "🌙", icon: "crescent" },
  { id: "eid-e-miladunnabi", nameBn: "ঈদে মিলাদুন্নবী", nameEn: "Eid-e-Miladunnabi (Mawlid)", hijriMonth: 3, hijriDay: 12, emoji: "🌙", icon: "crescent" },
  { id: "shab-e-barat", nameBn: "শবে বরাত", nameEn: "Shab-e-Barat", hijriMonth: 8, hijriDay: 15, emoji: "🌙", icon: "crescent" },
  { id: "shab-e-qadr", nameBn: "শবে কদর", nameEn: "Shab-e-Qadr", hijriMonth: 9, hijriDay: 27, emoji: "🌙", icon: "crescent" },
  { id: "eid-ul-fitr", nameBn: "ঈদুল ফিতর", nameEn: "Eid-ul-Fitr", hijriMonth: 10, hijriDay: 1, emoji: "🌙", icon: "crescent" },
  { id: "eid-ul-adha", nameBn: "ঈদুল আজহা", nameEn: "Eid-ul-Adha", hijriMonth: 12, hijriDay: 10, emoji: "🌙", icon: "crescent" },
];

/**
 * Resolve Islamic (Hijri) holidays for a Gregorian year, using the tabular
 * civil Hijri calendar (see hijri.ts) - a deterministic approximation of
 * the real moon-sighting-based calendar, so treat these dates the same
 * way as the sankranti caveat: usually right, occasionally a day off from
 * a specific country's official moon-sighting announcement.
 */
export function resolveIslamicHolidays(gregorianYear: number): ResolvedEvent[] {
  const hijriYearAtStart = gregorianToHijri(gregorianYear, 1, 1).year;
  const hijriYearAtEnd = gregorianToHijri(gregorianYear, 12, 31).year;
  const candidateYears = new Set([hijriYearAtStart, hijriYearAtStart + 1, hijriYearAtEnd]);

  const events: ResolvedEvent[] = [];
  for (const hy of candidateYears) {
    for (const h of ISLAMIC_HOLIDAYS) {
      const hijriDate: HijriDate = { year: hy, month: h.hijriMonth, day: h.hijriDay };
      const date = hijriToGregorian(hijriDate);
      if (date.year === gregorianYear) {
        events.push({
          festival: { id: h.id, nameBn: h.nameBn, nameEn: h.nameEn, category: "islamic", emoji: h.emoji, icon: h.icon },
          date,
        });
      }
    }
  }
  return events;
}

/** Meeus/Jones/Butcher algorithm for the Gregorian Easter Sunday date. */
export function gregorianEaster(year: number): CalendarDate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

export interface ResolvedEvent {
  festival: Pick<Festival, "id" | "nameBn" | "nameEn" | "category" | "emoji" | "icon">;
  date: CalendarDate;
}

/**
 * Resolve every rule-based Bengali festival that falls within a Bengali
 * year, using a precomputed array of that year's per-day panchang.
 */
export function resolveBengaliFestivals(bengaliYear: number, yearDays: DayInfo[]): ResolvedEvent[] {
  const events: ResolvedEvent[] = [];
  const resolvedIndexById = new Map<string, number>();

  for (const festival of BENGALI_FESTIVALS) {
    const rule = festival.rule;
    if (rule.kind === "tithiNearAnchor") continue;
    if (rule.kind === "bengaliMonthDay") {
      const idx = yearDays.findIndex(
        (d) => d.bengali.monthIndex === rule.monthIndex && d.bengali.day === rule.day
      );
      if (idx >= 0) {
        events.push({ festival, date: yearDays[idx].gregorian });
        resolvedIndexById.set(festival.id, idx);
      }
    } else if (rule.kind === "bengaliMonthLastDay") {
      const monthDays = yearDays.filter((d) => d.bengali.monthIndex === rule.monthIndex);
      const last = monthDays[monthDays.length - 1];
      if (last) {
        events.push({ festival, date: last.gregorian });
        resolvedIndexById.set(festival.id, yearDays.indexOf(last));
      }
    } else if (rule.kind === "tithi") {
      const idx = yearDays.findIndex(
        (d) =>
          d.bengali.monthIndex === rule.monthIndex &&
          d.panchang.tithi.paksha === rule.paksha &&
          d.panchang.tithi.index === rule.tithiIndex
      );
      if (idx >= 0) {
        events.push({ festival, date: yearDays[idx].gregorian });
        resolvedIndexById.set(festival.id, idx);
      }
    }
  }

  // Second pass: rules anchored to another (already-resolved) festival's
  // date, searched within an offset window from it instead of by raw
  // Bengali-month index -- see the comment on the Durga Puja rules above.
  for (const festival of BENGALI_FESTIVALS) {
    const rule = festival.rule;
    if (rule.kind !== "tithiNearAnchor") continue;
    const anchorIdx = resolvedIndexById.get(rule.anchorId);
    if (anchorIdx === undefined) continue;
    for (let offset = rule.minOffsetDays; offset <= rule.maxOffsetDays; offset++) {
      const day = yearDays[anchorIdx + offset];
      if (!day) break;
      if (day.panchang.tithi.paksha === rule.paksha && day.panchang.tithi.index === rule.tithiIndex) {
        events.push({ festival, date: day.gregorian });
        resolvedIndexById.set(festival.id, anchorIdx + offset);
        break;
      }
    }
  }

  return events;
}

/** Resolve Gregorian-fixed holidays (including Easter-derived ones) for a Gregorian year. */
export function resolveGregorianHolidays(gregorianYear: number): ResolvedEvent[] {
  const events: ResolvedEvent[] = GREGORIAN_HOLIDAYS.map((h) => ({
    festival: { id: h.id, nameBn: h.nameBn, nameEn: h.nameEn, category: "other", emoji: h.emoji, icon: h.icon },
    date: { year: gregorianYear, month: h.month, day: h.day },
  }));

  const easter = gregorianEaster(gregorianYear);
  const goodFriday = addDays(easter, -2);
  events.push(
    { festival: { id: "good-friday", nameBn: "গুড ফ্রাইডে", nameEn: "Good Friday", category: "other", emoji: "✝️", icon: "cross" }, date: goodFriday },
    { festival: { id: "easter-sunday", nameBn: "ইস্টার সানডে", nameEn: "Easter Sunday", category: "other", emoji: "🐣", icon: "egg" }, date: easter }
  );

  return events;
}

/** Build a dateKey -> events map, merging Bengali-festival and Gregorian-holiday events. */
export function buildEventIndex(events: ResolvedEvent[]): Map<string, ResolvedEvent[]> {
  const index = new Map<string, ResolvedEvent[]>();
  for (const event of events) {
    const key = dateKey(event.date);
    const list = index.get(key) ?? [];
    list.push(event);
    index.set(key, list);
  }
  return index;
}

/**
 * Convenience: all events (Bengali festivals + Gregorian holidays) whose
 * date falls within the given Gregorian year, indexed by date key.
 * `loc` only affects the Bengali-side sankranti/tithi timing.
 */
export function getEventIndexForGregorianYear(
  gregorianYear: number,
  bengaliYearDaysProvider: (bengaliYear: number) => DayInfo[],
  _loc: GeoLocation = KOLKATA
): Map<string, ResolvedEvent[]> {
  const bengaliYearsToScan = [gregorianYear - 594, gregorianYear - 593];
  const events: ResolvedEvent[] = [];
  for (const by of bengaliYearsToScan) {
    const days = bengaliYearDaysProvider(by);
    events.push(...resolveBengaliFestivals(by, days));
  }
  events.push(...resolveGregorianHolidays(gregorianYear));
  events.push(...resolveIslamicHolidays(gregorianYear));

  const filtered = events.filter((e) => e.date.year === gregorianYear);
  return buildEventIndex(filtered);
}
