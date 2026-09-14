import { DayDetail, KOLKATA, toBengaliNumber, BENGALI_MONTH_NAMES_EN, ENGLISH_MONTH_NAMES } from "@bong/panjika-core";
import { formatTimeBn, formatTimeRangeBn } from "../lib/format";
import StatTile from "./StatTile";
import FestivalBadge from "./FestivalBadge";

interface DayDetailPanelProps {
  detail: DayDetail;
  mode: "bn" | "en";
}

export default function DayDetailPanel({ detail, mode }: DayDetailPanelProps) {
  const { info, events, kalam, auspicious } = detail;
  const { bengali, panchang, sunTimes } = info;

  const bengaliDateLine = `${bengali.monthName} ${toBengaliNumber(bengali.day)}, ${toBengaliNumber(bengali.year)}`;
  const bengaliDateLineEn = `${BENGALI_MONTH_NAMES_EN[bengali.monthIndex]} ${bengali.day}, ${bengali.year}`;
  const gregorianDateLine = `${detail.date.day} ${ENGLISH_MONTH_NAMES[detail.date.month - 1]} ${detail.date.year}`;

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]/60 p-4 shadow-glow flex flex-col gap-4 animate-fade-in">
      <div>
        <p className="text-xs font-semibold tracking-wide text-[color:var(--accent)] bn">{bengali.weekdayName}</p>
        {mode === "bn" ? (
          <>
            <h3 className="text-2xl font-extrabold bn leading-tight">{bengaliDateLine}</h3>
            <p className="text-sm text-[color:var(--text-muted)]">{gregorianDateLine}</p>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-extrabold leading-tight">{gregorianDateLine}</h3>
            <p className="text-sm text-[color:var(--text-muted)] bn">
              {bengaliDateLine} <span className="num-en">· {bengaliDateLineEn}</span>
            </p>
          </>
        )}
      </div>

      {events.length > 0 && (
        <div
          className={`grid gap-3 justify-items-center ${events.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {events.map((e) => (
            <div key={e.festival.id} className="w-full max-w-[220px]">
              <FestivalBadge event={e} mode={mode} />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <StatTile
          label="তিথি · Tithi"
          value={panchang.tithi.name}
          sub={panchang.tithi.paksha === "shukla" ? "শুক্লপক্ষ" : "কৃষ্ণপক্ষ"}
          accent={panchang.tithi.paksha}
        />
        <StatTile label="নক্ষত্র · Nakshatra" value={panchang.nakshatra.name} sub={`পাদ ${toBengaliNumber(panchang.nakshatra.pada)}`} />
        <StatTile label="যোগ · Yoga" value={panchang.yoga.name} />
        <StatTile label="করণ · Karana" value={panchang.karana.name} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatTile label="সূর্যোদয় · Sunrise" value={formatTimeBn(sunTimes.sunriseLocal, KOLKATA)} />
        <StatTile label="সূর্যাস্ত · Sunset" value={formatTimeBn(sunTimes.sunsetLocal, KOLKATA)} />
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-[color:var(--text-muted)] font-semibold mb-1.5 bn">
          অশুভ সময় (কালবেলা)
        </p>
        <div className="flex flex-col gap-1.5">
          <KalamRow label="রাহুকাল" range={formatTimeRangeBn(kalam.rahuKalam.start, kalam.rahuKalam.end, KOLKATA)} />
          <KalamRow label="যমগণ্ড" range={formatTimeRangeBn(kalam.yamaganda.start, kalam.yamaganda.end, KOLKATA)} />
          <KalamRow label="গুলিক কাল" range={formatTimeRangeBn(kalam.gulikaKalam.start, kalam.gulikaKalam.end, KOLKATA)} />
        </div>
      </div>

      {auspicious.note && (
        <p className="text-xs text-[color:var(--text-muted)] bn leading-relaxed border-t border-[color:var(--border)] pt-3">
          {auspicious.note}
        </p>
      )}

      <p className="text-[10px] text-[color:var(--text-muted)] leading-relaxed border-t border-[color:var(--border)] pt-3">
        হিসাব ভিত্তি: আধুনিক জ্যোতির্বৈজ্ঞানিক অবস্থান (Meeus) + লাহিড়ী অয়নাংশ, কলকাতার জন্য গণনা করা। মুদ্রিত পঞ্জিকার
        সাথে সংক্রান্তি তারিখে ১–২ দিনের পার্থক্য থাকতে পারে, যা বিভিন্ন পঞ্জিকা-প্রকাশকের মধ্যেও স্বাভাবিক। ঈদ/মহররম/শবে
        বরাতের তারিখ হিসাব-ভিত্তিক (tabular) হিজরি ক্যালেন্ডার অনুযায়ী, বাস্তবে চাঁদ দেখার উপর ভিত্তি করে ঘোষিত তারিখের
        সাথে ১ দিন আগে-পিছে হতে পারে।
      </p>
    </div>
  );
}

function KalamRow({ label, range }: { label: string; range: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[color:var(--bg-soft)] px-3 py-1.5">
      <span className="text-xs font-medium bn">{label}</span>
      <span className="text-xs text-[color:var(--text-muted)] num-en">{range}</span>
    </div>
  );
}
