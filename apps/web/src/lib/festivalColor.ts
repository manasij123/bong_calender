import { FestivalCategory } from "@bong/panjika-core";

export const CATEGORY_COLOR: Record<FestivalCategory, string> = {
  "bengali-new-year": "#e0b93f",
  puja: "#c9414f",
  vrata: "#8a5fd1",
  solar: "#3f9e6d",
  other: "#4a8fd9",
  islamic: "#1a8f8f",
};

export const TITHI_BADGE_COLOR = {
  purnima: "#e0a63f",
  amavasya: "#7a7f94",
  ekadashi: "#d9714d",
};

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** A darker, fully-opaque version of a badge color, for a solid chip behind artwork. */
export function deepenColor(hex: string, factor = 0.5): string {
  const clean = hex.replace("#", "");
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  const r = parseInt(clean.substring(0, 2), 16) * factor;
  const g = parseInt(clean.substring(2, 4), 16) * factor;
  const b = parseInt(clean.substring(4, 6), 16) * factor;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
