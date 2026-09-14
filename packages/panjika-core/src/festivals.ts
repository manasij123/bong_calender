// Bengali Hindu festival rule engine. Most festivals are defined by a
// tithi (lunar day) falling within a specific Bengali solar month -- the
// same way printed panjikas derive them -- rather than hard-coded per-year
// dates, so they stay correct for any year the astronomical engine covers.
// A handful of festivals are purely solar (sankranti-based) or fixed.

import { CalendarDate, dateKey, findBengaliMonthStart, addDays } from "./bengaliCalendar.js";
import { DayInfo } from "./dayInfo.js";
import { GeoLocation, KOLKATA } from "./solarTime.js";
import { HijriDate, hijriToGregorian, gregorianToHijri } from "./hijri.js";
import { dateToJD } from "./julian.js";
import { getPanchang } from "./panchang.js";
import { PanchangSystem } from "./suryaSiddhanta.js";

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
  // Rabindranath died on 22 Shraban 1348 (7 August 1941) -- his death
  // anniversary "Baishe Shraban" is, like his birthday, fixed to the
  // Bengali date rather than the Gregorian one.
  { id: "rabindra-tirodhan", nameBn: "রবীন্দ্র তিরোধান দিবস (বাইশে শ্রাবণ)", nameEn: "Tagore's Death Anniversary (Baishe Shraban)", category: "other", rule: { kind: "bengaliMonthDay", monthIndex: 3, day: 22 }, emoji: "📖", icon: "book" },
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
  { id: "buddha-purnima", nameBn: "বুদ্ধ পূর্ণিমা", nameEn: "Buddha Purnima", category: "other", rule: { kind: "tithi", monthIndex: 0, paksha: "shukla", tithiIndex: 15 }, emoji: "☸️", icon: "diya" },
  { id: "ram-navami", nameBn: "রামনবমী", nameEn: "Ram Navami", category: "other", rule: { kind: "tithi", monthIndex: 11, paksha: "shukla", tithiIndex: 9 }, emoji: "🏹", icon: "diya" },
  { id: "mahavir-jayanti", nameBn: "মহাবীর জয়ন্তী", nameEn: "Mahavir Jayanti", category: "other", rule: { kind: "tithi", monthIndex: 11, paksha: "shukla", tithiIndex: 13 }, emoji: "🕉️", icon: "diya" },
  { id: "hanuman-jayanti", nameBn: "হনুমান জয়ন্তী", nameEn: "Hanuman Jayanti", category: "other", rule: { kind: "tithi", monthIndex: 11, paksha: "shukla", tithiIndex: 15 }, emoji: "🐒", icon: "diya" },
  { id: "chaitanya-mahaprabhu-jayanti", nameBn: "চৈতন্য মহাপ্রভুর জন্মতিথি (গৌর পূর্ণিমা)", nameEn: "Chaitanya Mahaprabhu Jayanti (Gaura Purnima)", category: "other", rule: { kind: "tithi", monthIndex: 10, paksha: "shukla", tithiIndex: 15 }, emoji: "🪔", icon: "diya" },
  { id: "harichand-thakur-jayanti", nameBn: "হরিচাঁদ ঠাকুরের জন্মতিথি", nameEn: "Harichand Thakur's Birthday", category: "other", rule: { kind: "tithi", monthIndex: 10, paksha: "krishna", tithiIndex: 13 }, emoji: "🪔", icon: "diya" },
  { id: "guru-nanak-jayanti", nameBn: "গুরু নানক জয়ন্তী (গুরপুরব)", nameEn: "Guru Nanak Jayanti (Gurpurab)", category: "other", rule: { kind: "tithi", monthIndex: 6, paksha: "shukla", tithiIndex: 15 }, emoji: "☬", icon: "diya" },
  { id: "lokenath-jayanti", nameBn: "লোকনাথ ব্রহ্মচারীর জন্মতিথি", nameEn: "Lokenath Brahmachari's Birthday", category: "other", rule: { kind: "bengaliMonthDay", monthIndex: 4, day: 18 }, emoji: "🪔", icon: "diya" },
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
  { id: "surya-sen-tirodhan", nameBn: "সূর্য সেনের ফাঁসি দিবস", nameEn: "Surya Sen's Execution Anniversary", month: 1, day: 12, emoji: "🇮🇳", icon: "flag" },
  { id: "netaji-jayanti", nameBn: "নেতাজি সুভাষচন্দ্র বসুর জন্মজয়ন্তী", nameEn: "Netaji Subhas Chandra Bose's Birthday", month: 1, day: 23, emoji: "🇮🇳", icon: "flag" },
  { id: "republic-day", nameBn: "প্রজাতন্ত্র দিবস", nameEn: "Republic Day (India)", month: 1, day: 26, emoji: "🇮🇳", icon: "flag" },
  { id: "sharat-chandra-tirodhan", nameBn: "শরৎচন্দ্র চট্টোপাধ্যায়ের প্রয়াণ দিবস", nameEn: "Sarat Chandra Chattopadhyay's Death Anniversary", month: 1, day: 16, emoji: "📖", icon: "book" },
  { id: "madhusudan-dutta-jayanti", nameBn: "মাইকেল মধুসূদন দত্তের জন্মজয়ন্তী", nameEn: "Michael Madhusudan Dutt's Birthday", month: 1, day: 25, emoji: "📖", icon: "book" },
  { id: "valentines-day", nameBn: "ভ্যালেন্টাইনস ডে", nameEn: "Valentine's Day", month: 2, day: 14, emoji: "❤️", icon: "heart" },
  { id: "meghnad-saha-tirodhan", nameBn: "মেঘনাদ সাহার প্রয়াণ দিবস", nameEn: "Meghnad Saha's Death Anniversary", month: 2, day: 16, emoji: "🔬", icon: "gear" },
  { id: "jibanananda-das-jayanti", nameBn: "জীবনানন্দ দাশের জন্মজয়ন্তী", nameEn: "Jibanananda Das's Birthday", month: 2, day: 17, emoji: "📖", icon: "book" },
  { id: "harichand-thakur-tirodhan", nameBn: "হরিচাঁদ ঠাকুরের তিরোধান দিবস", nameEn: "Harichand Thakur's Death Anniversary", month: 3, day: 5, emoji: "🪔", icon: "diya" },
  { id: "surya-sen-jayanti", nameBn: "সূর্য সেনের জন্মজয়ন্তী", nameEn: "Surya Sen's Birthday", month: 3, day: 22, emoji: "🇮🇳", icon: "flag" },
  { id: "bhagat-singh-tirodhan", nameBn: "ভগৎ সিংয়ের ফাঁসি দিবস", nameEn: "Bhagat Singh's Execution Anniversary", month: 3, day: 23, emoji: "🇮🇳", icon: "flag" },
  { id: "satyajit-ray-tirodhan", nameBn: "সত্যজিৎ রায়ের প্রয়াণ দিবস", nameEn: "Satyajit Ray's Death Anniversary", month: 4, day: 23, emoji: "🎬", icon: "star" },
  { id: "bankim-chandra-tirodhan", nameBn: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের প্রয়াণ দিবস", nameEn: "Bankim Chandra Chattopadhyay's Death Anniversary", month: 4, day: 8, emoji: "📖", icon: "book" },
  { id: "radhakrishnan-tirodhan", nameBn: "ডঃ সর্বপল্লী রাধাকৃষ্ণনের প্রয়াণ দিবস", nameEn: "Dr. Sarvepalli Radhakrishnan's Death Anniversary", month: 4, day: 17, emoji: "📖", icon: "book" },
  { id: "ambedkar-jayanti", nameBn: "ডঃ ভীমরাও আম্বেদকরের জন্মজয়ন্তী", nameEn: "Dr. B.R. Ambedkar's Birthday", month: 4, day: 14, emoji: "🇮🇳", icon: "flag" },
  { id: "may-day", nameBn: "মে দিবস", nameEn: "International Workers' Day", month: 5, day: 1, emoji: "🛠️", icon: "gear" },
  { id: "satyajit-ray-jayanti", nameBn: "সত্যজিৎ রায়ের জন্মজয়ন্তী", nameEn: "Satyajit Ray's Birthday", month: 5, day: 2, emoji: "🎬", icon: "star" },
  { id: "ashutosh-mukherjee-tirodhan", nameBn: "আশুতোষ মুখোপাধ্যায়ের প্রয়াণ দিবস", nameEn: "Ashutosh Mukherjee's Death Anniversary", month: 5, day: 25, emoji: "📖", icon: "book" },
  { id: "nazrul-jayanti", nameBn: "কাজী নজরুল ইসলামের জন্মজয়ন্তী", nameEn: "Kazi Nazrul Islam's Birthday", month: 5, day: 25, emoji: "📖", icon: "book" },
  { id: "nehru-tirodhan", nameBn: "জওহরলাল নেহেরুর প্রয়াণ দিবস", nameEn: "Jawaharlal Nehru's Death Anniversary", month: 5, day: 27, emoji: "🇮🇳", icon: "flag" },
  { id: "lokenath-tirodhan", nameBn: "লোকনাথ ব্রহ্মচারীর তিরোধান দিবস", nameEn: "Lokenath Brahmachari's Death Anniversary", month: 6, day: 1, emoji: "🪔", icon: "diya" },
  { id: "chittaranjan-das-tirodhan", nameBn: "চিত্তরঞ্জন দাশের প্রয়াণ দিবস", nameEn: "Chittaranjan Das's Death Anniversary", month: 6, day: 16, emoji: "🇮🇳", icon: "flag" },
  { id: "prafulla-chandra-ray-tirodhan", nameBn: "আচার্য প্রফুল্লচন্দ্র রায়ের প্রয়াণ দিবস", nameEn: "Acharya Prafulla Chandra Ray's Death Anniversary", month: 6, day: 16, emoji: "🔬", icon: "gear" },
  { id: "bankim-chandra-jayanti", nameBn: "বঙ্কিমচন্দ্র চট্টোপাধ্যায়ের জন্মজয়ন্তী", nameEn: "Bankim Chandra Chattopadhyay's Birthday", month: 6, day: 27, emoji: "📖", icon: "book" },
  { id: "ashutosh-mukherjee-jayanti", nameBn: "আশুতোষ মুখোপাধ্যায়ের জন্মজয়ন্তী", nameEn: "Ashutosh Mukherjee's Birthday", month: 6, day: 29, emoji: "📖", icon: "book" },
  { id: "madhusudan-dutta-tirodhan", nameBn: "মাইকেল মধুসূদন দত্তের প্রয়াণ দিবস", nameEn: "Michael Madhusudan Dutt's Death Anniversary", month: 6, day: 29, emoji: "📖", icon: "book" },
  { id: "vivekananda-tirodhan", nameBn: "স্বামী বিবেকানন্দের তিরোধান দিবস (মহাসমাধি)", nameEn: "Swami Vivekananda's Death Anniversary (Mahasamadhi)", month: 7, day: 4, emoji: "🧘", icon: "diya" },
  { id: "bidhan-chandra-roy-day", nameBn: "বিধানচন্দ্র রায়ের জন্ম ও প্রয়াণ দিবস (জাতীয় চিকিৎসক দিবস)", nameEn: "Bidhan Chandra Roy's Birth & Death Anniversary (National Doctors' Day)", month: 7, day: 1, emoji: "🇮🇳", icon: "gear" },
  { id: "bal-gangadhar-tilak-jayanti", nameBn: "বাল গঙ্গাধর তিলকের জন্মজয়ন্তী", nameEn: "Bal Gangadhar Tilak's Birthday", month: 7, day: 23, emoji: "🇮🇳", icon: "flag" },
  { id: "abdul-kalam-tirodhan", nameBn: "এ.পি.জে. আবদুল কালামের প্রয়াণ দিবস", nameEn: "A.P.J. Abdul Kalam's Death Anniversary", month: 7, day: 27, emoji: "🇮🇳", icon: "flag" },
  { id: "vidyasagar-tirodhan", nameBn: "ঈশ্বরচন্দ্র বিদ্যাসাগরের প্রয়াণ দিবস", nameEn: "Ishwar Chandra Vidyasagar's Death Anniversary", month: 7, day: 29, emoji: "📖", icon: "book" },
  { id: "sarada-devi-tirodhan", nameBn: "সারদা দেবীর তিরোধান দিবস", nameEn: "Sarada Devi's Death Anniversary", month: 7, day: 21, emoji: "🪔", icon: "diya" },
  { id: "bal-gangadhar-tilak-tirodhan", nameBn: "বাল গঙ্গাধর তিলকের প্রয়াণ দিবস", nameEn: "Bal Gangadhar Tilak's Death Anniversary", month: 8, day: 1, emoji: "🇮🇳", icon: "flag" },
  { id: "prafulla-chandra-ray-jayanti", nameBn: "আচার্য প্রফুল্লচন্দ্র রায়ের জন্মজয়ন্তী", nameEn: "Acharya Prafulla Chandra Ray's Birthday", month: 8, day: 2, emoji: "🔬", icon: "gear" },
  { id: "surendranath-banerjee-tirodhan", nameBn: "সুরেন্দ্রনাথ বন্দ্যোপাধ্যায়ের প্রয়াণ দিবস", nameEn: "Surendranath Banerjee's Death Anniversary", month: 8, day: 6, emoji: "🇮🇳", icon: "flag" },
  { id: "khudiram-bose-tirodhan", nameBn: "ক্ষুদিরাম বসুর ফাঁসি দিবস", nameEn: "Khudiram Bose's Execution Anniversary", month: 8, day: 11, emoji: "🇮🇳", icon: "flag" },
  { id: "independence-day", nameBn: "স্বাধীনতা দিবস", nameEn: "Independence Day (India)", month: 8, day: 15, emoji: "🇮🇳", icon: "flag" },
  { id: "ramakrishna-tirodhan", nameBn: "শ্রীরামকৃষ্ণের তিরোধান দিবস", nameEn: "Ramakrishna's Death Anniversary", month: 8, day: 16, emoji: "🪔", icon: "diya" },
  { id: "mother-teresa-jayanti", nameBn: "মাদার টেরেসার জন্মজয়ন্তী", nameEn: "Mother Teresa's Birthday", month: 8, day: 26, emoji: "🕊️", icon: "dove" },
  { id: "nazrul-tirodhan", nameBn: "কাজী নজরুল ইসলামের প্রয়াণ দিবস", nameEn: "Kazi Nazrul Islam's Death Anniversary", month: 8, day: 29, emoji: "📖", icon: "book" },
  { id: "teachers-day", nameBn: "শিক্ষক দিবস", nameEn: "Teachers' Day", month: 9, day: 5, emoji: "🍎", icon: "book" },
  { id: "radhakrishnan-jayanti", nameBn: "ডঃ সর্বপল্লী রাধাকৃষ্ণনের জন্মজয়ন্তী", nameEn: "Dr. Sarvepalli Radhakrishnan's Birthday", month: 9, day: 5, emoji: "📖", icon: "book" },
  { id: "mother-teresa-tirodhan", nameBn: "মাদার টেরেসার প্রয়াণ দিবস", nameEn: "Mother Teresa's Death Anniversary", month: 9, day: 5, emoji: "🕊️", icon: "dove" },
  { id: "sukumar-ray-tirodhan", nameBn: "সুকুমার রায়ের প্রয়াণ দিবস", nameEn: "Sukumar Ray's Death Anniversary", month: 9, day: 10, emoji: "📖", icon: "book" },
  { id: "bibhutibhushan-jayanti", nameBn: "বিভূতিভূষণ বন্দ্যোপাধ্যায়ের জন্মজয়ন্তী", nameEn: "Bibhutibhushan Bandyopadhyay's Birthday", month: 9, day: 12, emoji: "📖", icon: "book" },
  { id: "sharat-chandra-jayanti", nameBn: "শরৎচন্দ্র চট্টোপাধ্যায়ের জন্মজয়ন্তী", nameEn: "Sarat Chandra Chattopadhyay's Birthday", month: 9, day: 15, emoji: "📖", icon: "book" },
  { id: "vidyasagar-jayanti", nameBn: "ঈশ্বরচন্দ্র বিদ্যাসাগরের জন্মজয়ন্তী", nameEn: "Ishwar Chandra Vidyasagar's Birthday", month: 9, day: 26, emoji: "📖", icon: "book" },
  { id: "bhagat-singh-jayanti", nameBn: "ভগৎ সিংয়ের জন্মজয়ন্তী", nameEn: "Bhagat Singh's Birthday", month: 9, day: 28, emoji: "🇮🇳", icon: "flag" },
  { id: "gandhi-jayanti", nameBn: "গান্ধী জয়ন্তী", nameEn: "Gandhi Jayanti", month: 10, day: 2, emoji: "🕊️", icon: "dove" },
  { id: "meghnad-saha-jayanti", nameBn: "মেঘনাদ সাহার জন্মজয়ন্তী", nameEn: "Meghnad Saha's Birthday", month: 10, day: 6, emoji: "🔬", icon: "gear" },
  { id: "abdul-kalam-jayanti", nameBn: "এ.পি.জে. আবদুল কালামের জন্মজয়ন্তী", nameEn: "A.P.J. Abdul Kalam's Birthday", month: 10, day: 15, emoji: "🇮🇳", icon: "flag" },
  { id: "jibanananda-das-tirodhan", nameBn: "জীবনানন্দ দাশের প্রয়াণ দিবস", nameEn: "Jibanananda Das's Death Anniversary", month: 10, day: 22, emoji: "📖", icon: "book" },
  { id: "sukumar-ray-jayanti", nameBn: "সুকুমার রায়ের জন্মজয়ন্তী", nameEn: "Sukumar Ray's Birthday", month: 10, day: 30, emoji: "📖", icon: "book" },
  { id: "jagadish-bose-tirodhan", nameBn: "জগদীশচন্দ্র বসুর প্রয়াণ দিবস", nameEn: "Jagadish Chandra Bose's Death Anniversary", month: 11, day: 23, emoji: "🔬", icon: "gear" },
  { id: "bibhutibhushan-tirodhan", nameBn: "বিভূতিভূষণ বন্দ্যোপাধ্যায়ের প্রয়াণ দিবস", nameEn: "Bibhutibhushan Bandyopadhyay's Death Anniversary", month: 11, day: 1, emoji: "📖", icon: "book" },
  { id: "chittaranjan-das-jayanti", nameBn: "চিত্তরঞ্জন দাশের জন্মজয়ন্তী", nameEn: "Chittaranjan Das's Birthday", month: 11, day: 5, emoji: "🇮🇳", icon: "flag" },
  { id: "surendranath-banerjee-jayanti", nameBn: "সুরেন্দ্রনাথ বন্দ্যোপাধ্যায়ের জন্মজয়ন্তী", nameEn: "Surendranath Banerjee's Birthday", month: 11, day: 10, emoji: "🇮🇳", icon: "flag" },
  { id: "childrens-day", nameBn: "শিশু দিবস", nameEn: "Children's Day", month: 11, day: 14, emoji: "🎈", icon: "balloon" },
  { id: "nehru-jayanti", nameBn: "জওহরলাল নেহেরুর জন্মজয়ন্তী", nameEn: "Jawaharlal Nehru's Birthday", month: 11, day: 14, emoji: "🇮🇳", icon: "flag" },
  { id: "jagadish-bose-jayanti", nameBn: "জগদীশচন্দ্র বসুর জন্মজয়ন্তী", nameEn: "Jagadish Chandra Bose's Birthday", month: 11, day: 30, emoji: "🔬", icon: "gear" },
  { id: "khudiram-bose-jayanti", nameBn: "ক্ষুদিরাম বসুর জন্মজয়ন্তী", nameEn: "Khudiram Bose's Birthday", month: 12, day: 3, emoji: "🇮🇳", icon: "flag" },
  { id: "ambedkar-tirodhan", nameBn: "ডঃ ভীমরাও আম্বেদকরের প্রয়াণ দিবস", nameEn: "Dr. B.R. Ambedkar's Death Anniversary", month: 12, day: 6, emoji: "🇮🇳", icon: "flag" },
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
export function resolveBengaliFestivals(
  bengaliYear: number,
  yearDays: DayInfo[],
  system: PanchangSystem = "surya-siddhanta"
): ResolvedEvent[] {
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
  //
  // These specifically check the tithi a little after sunrise rather than
  // at the exact sunrise instant used everywhere else, so that a tithi
  // beginning shortly after one day's sunrise but comfortably before the
  // next day's is still credited to both days (matching how printed
  // panjikas -- and, in 2026, real transitions -- treat the Maha Saptami
  // window ahead of Durga Puja). The two systems' own transition timings
  // differ, so each gets its own buffer, tuned against a wide, stable
  // window of buffer values that all give the same result (drik:
  // 30-90 minutes; surya-siddhanta: 200-320 minutes, since its classical
  // single-epicycle Moon model places the same transition several hours
  // later relative to sunrise).
  const ANCHOR_TITHI_BUFFER_MIN = system === "surya-siddhanta" ? 240 : 45;
  for (const festival of BENGALI_FESTIVALS) {
    const rule = festival.rule;
    if (rule.kind !== "tithiNearAnchor") continue;
    const anchorIdx = resolvedIndexById.get(rule.anchorId);
    if (anchorIdx === undefined) continue;
    let firstMatchOffset: number | undefined;
    for (let offset = rule.minOffsetDays; offset <= rule.maxOffsetDays; offset++) {
      const day = yearDays[anchorIdx + offset];
      if (!day) break;
      const refTime = new Date(day.sunTimes.sunriseLocal.getTime() + ANCHOR_TITHI_BUFFER_MIN * 60000);
      const tithi = getPanchang(dateToJD(refTime), system).tithi;
      const matches = tithi.paksha === rule.paksha && tithi.index === rule.tithiIndex;
      if (matches) {
        // A tithi can span two consecutive sunrises (as Saptami does ahead
        // of Durga Puja in 2026) -- record every day it's the prevailing
        // tithi, not just the first, so both days show the occasion.
        events.push({ festival, date: day.gregorian });
        firstMatchOffset ??= offset;
      } else if (firstMatchOffset !== undefined) {
        break; // past the (1-2 day) run that matched
      }
    }
    if (firstMatchOffset !== undefined) resolvedIndexById.set(festival.id, anchorIdx + firstMatchOffset);
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
  _loc: GeoLocation = KOLKATA,
  system: PanchangSystem = "surya-siddhanta"
): Map<string, ResolvedEvent[]> {
  const bengaliYearsToScan = [gregorianYear - 594, gregorianYear - 593];
  const events: ResolvedEvent[] = [];
  for (const by of bengaliYearsToScan) {
    const days = bengaliYearDaysProvider(by);
    events.push(...resolveBengaliFestivals(by, days, system));
  }
  events.push(...resolveGregorianHolidays(gregorianYear));
  events.push(...resolveIslamicHolidays(gregorianYear));

  const filtered = events.filter((e) => e.date.year === gregorianYear);
  return buildEventIndex(filtered);
}
