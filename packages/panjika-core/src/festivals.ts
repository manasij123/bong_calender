// Bengali Hindu festival rule engine. Most festivals are defined by a
// tithi (lunar day) falling within a specific Bengali solar month -- the
// same way printed panjikas derive them -- rather than hard-coded per-year
// dates, so they stay correct for any year the astronomical engine covers.
// A handful of festivals are purely solar (sankranti-based) or fixed.

import { CalendarDate, dateKey, findBengaliMonthStart, addDays } from "./bengaliCalendar.js";
import { DayInfo } from "./dayInfo.js";
import { GeoLocation, KOLKATA } from "./solarTime.js";

export type FestivalCategory = "bengali-new-year" | "puja" | "vrata" | "solar" | "other";

export type FestivalRule =
  | { kind: "tithi"; monthIndex: number; paksha: "shukla" | "krishna"; tithiIndex: number }
  | { kind: "bengaliMonthDay"; monthIndex: number; day: number }
  | { kind: "bengaliMonthLastDay"; monthIndex: number };

export interface Festival {
  id: string;
  nameBn: string;
  nameEn: string;
  category: FestivalCategory;
  rule: FestivalRule;
  emoji: string;
}

export const BENGALI_FESTIVALS: Festival[] = [
  { id: "poila-boishakh", nameBn: "পয়লা বৈশাখ (নববর্ষ)", nameEn: "Bengali New Year", category: "bengali-new-year", rule: { kind: "bengaliMonthDay", monthIndex: 0, day: 1 }, emoji: "🎊" },
  { id: "rath-yatra", nameBn: "রথযাত্রা", nameEn: "Rath Yatra", category: "puja", rule: { kind: "tithi", monthIndex: 2, paksha: "shukla", tithiIndex: 2 }, emoji: "🛺" },
  { id: "ulto-rath", nameBn: "উল্টো রথ", nameEn: "Ulto Rath", category: "puja", rule: { kind: "tithi", monthIndex: 2, paksha: "shukla", tithiIndex: 10 }, emoji: "🛺" },
  { id: "guru-purnima", nameBn: "গুরু পূর্ণিমা", nameEn: "Guru Purnima", category: "vrata", rule: { kind: "tithi", monthIndex: 2, paksha: "shukla", tithiIndex: 15 }, emoji: "🙏" },
  { id: "jhulan-yatra", nameBn: "ঝুলনযাত্রা শুরু", nameEn: "Jhulan Yatra Begins", category: "puja", rule: { kind: "tithi", monthIndex: 3, paksha: "shukla", tithiIndex: 11 }, emoji: "🎐" },
  { id: "rakhi-purnima", nameBn: "রাখী বন্ধন / ঝুলন পূর্ণিমা", nameEn: "Rakhi Bandhan (Raksha Bandhan)", category: "vrata", rule: { kind: "tithi", monthIndex: 3, paksha: "shukla", tithiIndex: 15 }, emoji: "🧵" },
  { id: "janmashtami", nameBn: "জন্মাষ্টমী", nameEn: "Janmashtami", category: "puja", rule: { kind: "tithi", monthIndex: 4, paksha: "krishna", tithiIndex: 8 }, emoji: "🪈" },
  { id: "ganesh-chaturthi", nameBn: "গণেশ চতুর্থী", nameEn: "Ganesh Chaturthi", category: "puja", rule: { kind: "tithi", monthIndex: 4, paksha: "shukla", tithiIndex: 4 }, emoji: "🐘" },
  { id: "vishwakarma-puja", nameBn: "বিশ্বকর্মা পূজা", nameEn: "Vishwakarma Puja", category: "solar", rule: { kind: "bengaliMonthLastDay", monthIndex: 4 }, emoji: "⚙️" },
  { id: "mahalaya", nameBn: "মহালয়া", nameEn: "Mahalaya", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "krishna", tithiIndex: 15 }, emoji: "🪔" },
  { id: "maha-shashthi", nameBn: "মহাষষ্ঠী", nameEn: "Maha Shashthi (Durga Puja)", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "shukla", tithiIndex: 6 }, emoji: "🪔" },
  { id: "maha-saptami", nameBn: "মহাসপ্তমী", nameEn: "Maha Saptami (Durga Puja)", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "shukla", tithiIndex: 7 }, emoji: "🪔" },
  { id: "maha-ashtami", nameBn: "মহাষ্টমী", nameEn: "Maha Ashtami (Durga Puja)", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "shukla", tithiIndex: 8 }, emoji: "🪔" },
  { id: "maha-nabami", nameBn: "মহানবমী", nameEn: "Maha Nabami (Durga Puja)", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "shukla", tithiIndex: 9 }, emoji: "🪔" },
  { id: "vijaya-dashami", nameBn: "বিজয়া দশমী", nameEn: "Vijaya Dashami", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "shukla", tithiIndex: 10 }, emoji: "🪔" },
  { id: "kojagari-lakshmi-puja", nameBn: "কোজাগরী লক্ষ্মী পূজা", nameEn: "Kojagari Lakshmi Puja", category: "puja", rule: { kind: "tithi", monthIndex: 5, paksha: "shukla", tithiIndex: 15 }, emoji: "🪷" },
  { id: "kali-puja", nameBn: "কালীপূজা / দীপাবলি", nameEn: "Kali Puja / Diwali", category: "puja", rule: { kind: "tithi", monthIndex: 6, paksha: "krishna", tithiIndex: 15 }, emoji: "🪔" },
  { id: "bhai-phota", nameBn: "ভাইফোঁটা", nameEn: "Bhai Phota (Bhai Dooj)", category: "vrata", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 2 }, emoji: "🎀" },
  { id: "chhath-puja", nameBn: "ছট পূজা", nameEn: "Chhath Puja", category: "puja", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 6 }, emoji: "🌅" },
  { id: "rash-purnima", nameBn: "রাস পূর্ণিমা", nameEn: "Rash Purnima", category: "puja", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 15 }, emoji: "🪷" },
  { id: "saraswati-puja", nameBn: "সরস্বতী পূজা (বসন্ত পঞ্চমী)", nameEn: "Saraswati Puja (Basant Panchami)", category: "puja", rule: { kind: "tithi", monthIndex: 9, paksha: "shukla", tithiIndex: 5 }, emoji: "📚" },
  { id: "shivratri", nameBn: "শিবরাত্রি", nameEn: "Maha Shivaratri", category: "vrata", rule: { kind: "tithi", monthIndex: 10, paksha: "krishna", tithiIndex: 14 }, emoji: "🔱" },
  { id: "dol-purnima", nameBn: "দোলযাত্রা / হোলি", nameEn: "Dol Purnima / Holi", category: "puja", rule: { kind: "tithi", monthIndex: 10, paksha: "shukla", tithiIndex: 15 }, emoji: "🎨" },
  { id: "annapurna-puja", nameBn: "অন্নপূর্ণা পূজা", nameEn: "Annapurna Puja", category: "puja", rule: { kind: "tithi", monthIndex: 10, paksha: "krishna", tithiIndex: 8 }, emoji: "🍚" },
  { id: "charak-gajan", nameBn: "চড়ক পূজা / গাজন", nameEn: "Charak Puja / Gajan", category: "solar", rule: { kind: "bengaliMonthLastDay", monthIndex: 11 }, emoji: "🔥" },
];

export const GREGORIAN_HOLIDAYS: {
  id: string;
  nameBn: string;
  nameEn: string;
  month: number;
  day: number;
  emoji: string;
}[] = [
  { id: "new-year", nameBn: "ইংরেজি নববর্ষ", nameEn: "New Year's Day", month: 1, day: 1, emoji: "🎉" },
  { id: "republic-day", nameBn: "প্রজাতন্ত্র দিবস", nameEn: "Republic Day (India)", month: 1, day: 26, emoji: "🇮🇳" },
  { id: "valentines-day", nameBn: "ভ্যালেন্টাইনস ডে", nameEn: "Valentine's Day", month: 2, day: 14, emoji: "❤️" },
  { id: "may-day", nameBn: "মে দিবস", nameEn: "International Workers' Day", month: 5, day: 1, emoji: "🛠️" },
  { id: "independence-day", nameBn: "স্বাধীনতা দিবস", nameEn: "Independence Day (India)", month: 8, day: 15, emoji: "🇮🇳" },
  { id: "teachers-day", nameBn: "শিক্ষক দিবস", nameEn: "Teachers' Day", month: 9, day: 5, emoji: "🍎" },
  { id: "gandhi-jayanti", nameBn: "গান্ধী জয়ন্তী", nameEn: "Gandhi Jayanti", month: 10, day: 2, emoji: "🕊️" },
  { id: "childrens-day", nameBn: "শিশু দিবস", nameEn: "Children's Day", month: 11, day: 14, emoji: "🎈" },
  { id: "christmas-eve", nameBn: "বড়দিনের প্রাক্কাল", nameEn: "Christmas Eve", month: 12, day: 24, emoji: "🎄" },
  { id: "christmas", nameBn: "বড়দিন", nameEn: "Christmas", month: 12, day: 25, emoji: "🎄" },
  { id: "new-years-eve", nameBn: "বর্ষবরণ", nameEn: "New Year's Eve", month: 12, day: 31, emoji: "🥂" },
];

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
  festival: Pick<Festival, "id" | "nameBn" | "nameEn" | "category" | "emoji">;
  date: CalendarDate;
}

/**
 * Resolve every rule-based Bengali festival that falls within a Bengali
 * year, using a precomputed array of that year's per-day panchang.
 */
export function resolveBengaliFestivals(bengaliYear: number, yearDays: DayInfo[]): ResolvedEvent[] {
  const events: ResolvedEvent[] = [];
  for (const festival of BENGALI_FESTIVALS) {
    const rule = festival.rule;
    if (rule.kind === "bengaliMonthDay") {
      const day = yearDays.find(
        (d) => d.bengali.monthIndex === rule.monthIndex && d.bengali.day === rule.day
      );
      if (day) events.push({ festival, date: day.gregorian });
    } else if (rule.kind === "bengaliMonthLastDay") {
      const monthDays = yearDays.filter((d) => d.bengali.monthIndex === rule.monthIndex);
      const last = monthDays[monthDays.length - 1];
      if (last) events.push({ festival, date: last.gregorian });
    } else if (rule.kind === "tithi") {
      const match = yearDays.find(
        (d) =>
          d.bengali.monthIndex === rule.monthIndex &&
          d.panchang.tithi.paksha === rule.paksha &&
          d.panchang.tithi.index === rule.tithiIndex
      );
      if (match) events.push({ festival, date: match.gregorian });
    }
  }
  return events;
}

/** Resolve Gregorian-fixed holidays (including Easter-derived ones) for a Gregorian year. */
export function resolveGregorianHolidays(gregorianYear: number): ResolvedEvent[] {
  const events: ResolvedEvent[] = GREGORIAN_HOLIDAYS.map((h) => ({
    festival: { id: h.id, nameBn: h.nameBn, nameEn: h.nameEn, category: "other", emoji: h.emoji },
    date: { year: gregorianYear, month: h.month, day: h.day },
  }));

  const easter = gregorianEaster(gregorianYear);
  const goodFriday = addDays(easter, -2);
  events.push(
    { festival: { id: "good-friday", nameBn: "গুড ফ্রাইডে", nameEn: "Good Friday", category: "other", emoji: "✝️" }, date: goodFriday },
    { festival: { id: "easter-sunday", nameBn: "ইস্টার সানডে", nameEn: "Easter Sunday", category: "other", emoji: "🐣" }, date: easter }
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

  const filtered = events.filter((e) => e.date.year === gregorianYear);
  return buildEventIndex(filtered);
}
