import { ResolvedEvent } from "@bong/panjika-core";
import FestivalIconGlyph from "./festivalIcons";
import CyclingImage from "./CyclingImage";
import MarqueeText from "./MarqueeText";
import { CATEGORY_COLOR, deepenColor } from "../lib/festivalColor";
import { FESTIVAL_IMAGES } from "../lib/festivalImages";

interface FestivalBadgeProps {
  event: ResolvedEvent;
  mode: "bn" | "en";
  size?: "sm" | "lg";
}

export default function FestivalBadge({ event, mode, size = "lg" }: FestivalBadgeProps) {
  const color = CATEGORY_COLOR[event.festival.category];
  const isLarge = size === "lg";
  const images = FESTIVAL_IMAGES[event.festival.id];
  const name = mode === "bn" ? event.festival.nameBn : event.festival.nameEn;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border-[3px] bg-[color:var(--festival-badge-bg)] flex flex-col items-center justify-center shadow-glow ${
        isLarge ? "aspect-[4/3] p-4 gap-2" : "aspect-square p-2 gap-1"
      }`}
      style={{ borderColor: color }}
    >
      {images ? (
        <div
          className={`rounded-xl flex items-center justify-center min-h-0 ${isLarge ? "w-full flex-1 p-2" : "h-8 w-8"}`}
          style={{ backgroundColor: deepenColor(color), ["--festival-art-tint" as string]: "#000000" }}
        >
          <CyclingImage images={images} alt={name} className={isLarge ? "h-20 w-20 sm:h-24 sm:w-24" : "h-full w-full"} />
        </div>
      ) : (
        <div style={{ color }} className={isLarge ? "h-16 w-16 sm:h-20 sm:w-20" : "h-8 w-8"}>
          <FestivalIconGlyph icon={event.festival.icon} className="h-full w-full" />
        </div>
      )}

      {isLarge ? (
        <MarqueeText
          text={name}
          className="w-full shrink-0 bn font-extrabold text-center text-[color:var(--text)] text-base px-1 z-10"
        />
      ) : (
        <span className="sr-only">{name}</span>
      )}
    </div>
  );
}
