import {
  CalendarDate,
  PanchangSystem,
  ResolvedEvent,
  getFestivalEventsForYear,
  toBengaliDate,
  toBengaliNumber,
  findBengaliMonthStart,
  addDays,
  dateKey,
  today,
  KOLKATA,
  BENGALI_MONTH_NAMES,
  ENGLISH_MONTH_NAMES,
} from "@bong/panjika-core";

// --- Fuzzy text matching -----------------------------------------------
//
// People typing an English transliteration of a Bengali word rarely agree
// on spelling ("Janmashtami" vs "jonmastomi" vs "jonmastmi"). We normalize
// away the most common sources of that variance (sh/th/kh-style digraphs,
// doubled letters) and then fall back to edit-distance for whatever's
// left (typically a vowel swap). Bengali-script queries skip all of that
// since misspelling in-script is much rarer -- they just get a plain
// substring/fuzzy check.

const BENGALI_RANGE = /[ঀ-৿]/;

function normalizeLatin(s: string): string {
  let out = s.toLowerCase().replace(/[^a-z]/g, "");
  const digraphs: [RegExp, string][] = [
    [/chh/g, "ch"],
    [/sh/g, "s"],
    [/th/g, "t"],
    [/kh/g, "k"],
    [/gh/g, "g"],
    [/ph/g, "f"],
    [/aa/g, "a"],
    [/ee/g, "i"],
    [/ii/g, "i"],
    [/oo/g, "u"],
  ];
  for (const [pattern, replacement] of digraphs) out = out.replace(pattern, replacement);
  out = out.replace(/(.)\1+/g, "$1");
  return out;
}

function normalizeBengali(s: string): string {
  return Array.from(s)
    .filter((ch) => BENGALI_RANGE.test(ch))
    .join("");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** Adjacent-word pairs joined together, so a query typed as one run-on word
 * (e.g. "kalipuza" for "Kali Puja") can still fuzzy-match a two-word name.
 * Kept separate from single words: joining two unrelated words can
 * coincidentally land close to an unrelated query, so pairs get a tighter,
 * fixed edit budget rather than the length-scaled one below. */
function adjacentPairs(words: string[]): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < words.length - 1; i++) pairs.push(words[i] + words[i + 1]);
  return pairs;
}

function wordThreshold(word: string): number {
  return word.length <= 4 ? 1 : Math.min(3, Math.max(2, Math.ceil(word.length * 0.25)));
}

function isFuzzyMatch(normQuery: string, normTargetWhole: string, targetWords: string[]): boolean {
  if (normQuery.length === 0) return false;
  if (normTargetWhole.includes(normQuery)) return true;
  // Short words (<3 chars) are skipped for fuzzy comparison -- an edit-distance
  // check on something like "e" or "s" matches almost anything, so only an
  // exact substring hit (above) should count for them. Short-but-not-tiny
  // words get a tight (1-edit) budget for the same reason: a distance-2
  // allowance on a 3-4 letter word effectively matches most other short words.
  for (const word of targetWords) {
    if (word.length < 3) continue;
    if (Math.abs(word.length - normQuery.length) > 3) continue;
    if (levenshtein(normQuery, word) <= wordThreshold(word)) return true;
  }
  for (const pair of adjacentPairs(targetWords)) {
    if (Math.abs(pair.length - normQuery.length) > 2) continue;
    if (levenshtein(normQuery, pair) <= 2) return true;
  }
  return false;
}

/** True if `query` plausibly refers to `name` (English or Bengali), tolerating common misspellings. */
export function fuzzyNameMatches(query: string, name: string): boolean {
  const q = query.trim();
  if (!q) return false;
  if (BENGALI_RANGE.test(q)) {
    const nq = normalizeBengali(q);
    const nt = normalizeBengali(name);
    if (nq.length === 0) return false;
    if (nt.includes(nq)) return true;
    const words = name.split(/[^ঀ-৿]+/).map(normalizeBengali).filter(Boolean);
    return isFuzzyMatch(nq, nt, words);
  }
  const nq = normalizeLatin(q);
  const nt = normalizeLatin(name);
  const words = name
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .map(normalizeLatin);
  return isFuzzyMatch(nq, nt, words);
}

// --- Date parsing --------------------------------------------------------

const BENGALI_DIGIT_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function toLatinDigits(s: string): string {
  return s.replace(/[০-৯]/g, (ch) => BENGALI_DIGIT_MAP[ch] ?? ch);
}

function matchMonthName(word: string, names: string[]): number {
  const w = word.toLowerCase();
  if (!w) return -1;
  const exact = names.findIndex((n) => n.toLowerCase() === w);
  if (exact >= 0) return exact;
  const prefix = names.findIndex((n) => n.toLowerCase().startsWith(w) && w.length >= 3);
  if (prefix >= 0) return prefix;
  return names.findIndex((n) => fuzzyNameMatches(word, n));
}

/** Best-effort parse of a typed date (numeric, "15 August", or a Bengali month name + day). */
export function parseDateQuery(query: string, system: PanchangSystem = "surya-siddhanta"): CalendarDate[] {
  const raw = toLatinDigits(query).trim();
  if (!raw) return [];
  const t = today();
  const results: CalendarDate[] = [];

  const numeric = raw.match(/^(\d{1,2})[\/\-.\s](\d{1,2})(?:[\/\-.\s](\d{2,4}))?$/);
  if (numeric) {
    const day = parseInt(numeric[1], 10);
    const month = parseInt(numeric[2], 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      if (numeric[3]) {
        let year = parseInt(numeric[3], 10);
        if (year < 100) year += 2000;
        results.push({ year, month, day });
      } else {
        for (const y of [t.year, t.year + 1, t.year - 1]) results.push({ year: y, month, day });
      }
      return results;
    }
  }

  const wordy = raw.match(/^(\d{1,2})\s+([a-zA-Zঀ-৿]+)$/) ?? raw.match(/^([a-zA-Zঀ-৿]+)\s+(\d{1,2})$/);
  if (wordy) {
    const isDayFirst = /^\d/.test(wordy[1]);
    const day = parseInt(isDayFirst ? wordy[1] : wordy[2], 10);
    const word = isDayFirst ? wordy[2] : wordy[1];
    if (day >= 1 && day <= 32) {
      const enIdx = matchMonthName(word, ENGLISH_MONTH_NAMES);
      if (enIdx >= 0) {
        for (const y of [t.year, t.year + 1, t.year - 1]) results.push({ year: y, month: enIdx + 1, day });
        return results;
      }
      const bnIdx = BENGALI_RANGE.test(word) ? BENGALI_MONTH_NAMES.findIndex((n) => n === word) : -1;
      if (bnIdx >= 0) {
        const tb = toBengaliDate(t, KOLKATA, system);
        for (const by of [tb.year, tb.year + 1, tb.year - 1]) {
          try {
            const start = findBengaliMonthStart(by, bnIdx, KOLKATA, system);
            results.push(addDays(start, day - 1));
          } catch {
            // ignore out-of-range attempts
          }
        }
        return results;
      }
    }
  }

  return results;
}

// --- Search index over the curated festival/holiday list -----------------

export interface FestivalSearchEntry {
  id: string;
  nameBn: string;
  nameEn: string;
  dates: CalendarDate[];
}

/** Build (and cache) a searchable index of festival occurrences across a span of years around `centerYear`. */
export function buildFestivalSearchIndex(
  centerYear: number,
  system: PanchangSystem = "surya-siddhanta",
  yearsBack = 1,
  yearsForward = 3
): FestivalSearchEntry[] {
  const byId = new Map<string, FestivalSearchEntry>();
  for (let y = centerYear - yearsBack; y <= centerYear + yearsForward; y++) {
    const events: ResolvedEvent[] = getFestivalEventsForYear(y, KOLKATA, system);
    for (const e of events) {
      let entry = byId.get(e.festival.id);
      if (!entry) {
        entry = { id: e.festival.id, nameBn: e.festival.nameBn, nameEn: e.festival.nameEn, dates: [] };
        byId.set(e.festival.id, entry);
      }
      entry.dates.push(e.date);
    }
  }
  for (const entry of byId.values()) entry.dates.sort((a, b) => (dateKey(a) < dateKey(b) ? -1 : 1));
  return Array.from(byId.values());
}

export interface SearchResult {
  kind: "date" | "festival";
  date: CalendarDate;
  primary: string;
  secondary: string;
}

/** Pick the occurrence closest to today, preferring today-or-later. */
function nearestOccurrence(dates: CalendarDate[]): CalendarDate {
  const t = today();
  const tKey = dateKey(t);
  const future = dates.find((d) => dateKey(d) >= tKey);
  return future ?? dates[dates.length - 1];
}

function bengaliDateLabel(date: CalendarDate, system: PanchangSystem): string {
  const bd = toBengaliDate(date, KOLKATA, system);
  return `${BENGALI_MONTH_NAMES[bd.monthIndex]} ${toBengaliNumber(bd.day)}, ${toBengaliNumber(bd.year)}`;
}

function englishDateLabel(date: CalendarDate): string {
  return `${date.day} ${ENGLISH_MONTH_NAMES[date.month - 1]} ${date.year}`;
}

/** "১ বৈশাখ, ১৪৩৩" or "15 August 2026", plus the other calendar's date as a subtitle. */
function formatDateLabels(
  date: CalendarDate,
  mode: "bn" | "en",
  system: PanchangSystem
): { primary: string; secondary: string } {
  const bnLabel = bengaliDateLabel(date, system);
  const enLabel = englishDateLabel(date);
  return mode === "bn" ? { primary: bnLabel, secondary: enLabel } : { primary: enLabel, secondary: bnLabel };
}

export function searchFestivals(
  query: string,
  index: FestivalSearchEntry[],
  mode: "bn" | "en",
  system: PanchangSystem = "surya-siddhanta",
  limit = 8
): SearchResult[] {
  const q = query.trim();
  if (!q) return [];

  const results: SearchResult[] = [];
  const seenKeys = new Set<string>();

  for (const d of parseDateQuery(q, system)) {
    const key = dateKey(d);
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    results.push({ kind: "date", date: d, ...formatDateLabels(d, mode, system) });
    if (results.length >= 2) break;
  }

  for (const entry of index) {
    if (results.length >= limit) break;
    if (entry.dates.length === 0) continue;
    if (fuzzyNameMatches(q, entry.nameEn) || fuzzyNameMatches(q, entry.nameBn)) {
      const date = nearestOccurrence(entry.dates);
      results.push({
        kind: "festival",
        date,
        primary: mode === "bn" ? entry.nameBn : entry.nameEn,
        secondary: mode === "bn" ? bengaliDateLabel(date, system) : englishDateLabel(date),
      });
    }
  }

  return results.slice(0, limit);
}
