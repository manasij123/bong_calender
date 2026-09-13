import { toBengaliNumber, GeoLocation } from "@bong/panjika-core";

export function istParts(date: Date, loc: GeoLocation) {
  const shifted = new Date(date.getTime() + loc.timezoneOffsetHours * 3600000);
  return { h: shifted.getUTCHours(), m: shifted.getUTCMinutes() };
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

function bnPadded(n: number, pad: number): string {
  return String(n)
    .padStart(pad, "0")
    .split("")
    .map((ch) => BN_DIGITS[Number(ch)])
    .join("");
}

export function formatTimeBn(date: Date, loc: GeoLocation): string {
  const { h, m } = istParts(date, loc);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${toBengaliNumber(h12)}:${bnPadded(m, 2)} ${period}`;
}

export function formatTimeRangeBn(start: Date, end: Date, loc: GeoLocation): string {
  return `${formatTimeBn(start, loc)} – ${formatTimeBn(end, loc)}`;
}
