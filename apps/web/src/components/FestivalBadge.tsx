import { ResolvedEvent } from "@bong/panjika-core";
import FestivalIconGlyph from "./festivalIcons";
import CyclingImage from "./CyclingImage";
import { CATEGORY_COLOR } from "../lib/festivalColor";
import { FESTIVAL_IMAGES } from "../lib/festivalImages";

interface FestivalBadgeProps {
  event: ResolvedEvent;
  bengaliDayLabel: string;
  gregorianDayLabel: string;
  mode: "bn" | "en";
  size?: "sm" | "lg";
}

export default function FestivalBadge({
  event,
  bengaliDayLabel,
  gregorianDayLabel,
  mode,
  size = "lg",
}: FestivalBadgeProps) {
  const color = CATEGORY_COLOR[event.festival.category];
  const isLarge = size === "lg";
  const images = FESTIVAL_IMAGES[event.festival.id];
  const name = mode === "bn" ? event.festival.nameBn : event.festival.nameEn;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-[3px] bg-[#0d0e14] flex flex-col items-center justify-between shadow-glow ${
        isLarge ? "aspect-[4/3.4] p-4" : "aspect-square p-2"
      }`}
      style={{ borderColor: color }}
    >
      <div className="w-full flex items-start justify-between z-10">
        <span className={`bn font-bold text-white/90 ${isLarge ? "text-xl" : "text-xs"}`}>{bengaliDayLabel}</span>
        <span className={`font-bold text-white/90 num-en ${isLarge ? "text-xl" : "text-xs"}`}>{gregorianDayLabel}</span>
      </div>

      {images ? (
        <CyclingImage images={images} alt={name} className={isLarge ? "h-32 w-32 sm:h-36 sm:w-36" : "h-8 w-8"} />
      ) : (
        <div style={{ color }} className={isLarge ? "h-20 w-20" : "h-8 w-8"}>
          <FestivalIconGlyph icon={event.festival.icon} className="h-full w-full" />
        </div>
      )}

      {isLarge ? (
        <p className="bn font-extrabold text-center text-white leading-tight text-base px-1 z-10">{name}</p>
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </div>
  );
}
