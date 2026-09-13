const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert a non-negative integer to Bengali numerals. */
export function toBengaliNumber(n: number): string {
  return String(Math.trunc(n))
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? BENGALI_DIGITS[Number(ch)] : ch))
    .join("");
}

export const BENGALI_MONTH_NAMES = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

/** Number of the Bengali month names above, for interoperability. */
export const BENGALI_MONTH_COUNT = BENGALI_MONTH_NAMES.length;

export const BENGALI_WEEKDAY_NAMES = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

export const BENGALI_WEEKDAY_SHORT = ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"];
export const BENGALI_WEEKDAY_INITIAL = ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"];

export const ENGLISH_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const ENGLISH_WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const BENGALI_MONTH_NAMES_EN = [
  "Boishakh",
  "Joishtho",
  "Asharh",
  "Shrabon",
  "Bhadro",
  "Ashwin",
  "Kartik",
  "Agrahayan",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];
