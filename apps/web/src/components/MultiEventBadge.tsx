import { useEffect, useState } from "react";
import { ResolvedEvent } from "@bong/panjika-core";
import FestivalIconGlyph from "./festivalIcons";
import CyclingImage from "./CyclingImage";
import MarqueeText from "./MarqueeText";
import { CATEGORY_COLOR, deepenColor } from "../lib/festivalColor";
import { FESTIVAL_IMAGES } from "../lib/festivalImages";
import AnimatedValue from "./AnimatedValue";

interface MultiEventBadgeProps {
  events: ResolvedEvent[];
  mode: "bn" | "en";
  primaryDateLabel: string;
  isSunday: boolean;
  intervalMs?: number;
}

/**
 * A calendar cell can land on more than one event on the same day (e.g.
 * Raksha Bandhan and Vidyasagar's death anniversary both fall on 29 July
 * 2026) -- there's only room for one badge, so this cycles through each
 * event's image+name in turn, then the plain date, then repeats.
 */
export default function MultiEventBadge({
  events,
  mode,
  primaryDateLabel,
  isSunday,
  intervalMs = 3000,
}: MultiEventBadgeProps) {
  const frameCount = events.length + 1;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const id = setInterval(() => setIndex((i) => (i + 1) % frameCount), intervalMs);
    return () => clearInterval(id);
  }, [frameCount, intervalMs]);

  if (index >= events.length) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center animate-fade-in">
        <span
          className={`text-2xl sm:text-3xl font-bold leading-none ${mode === "bn" ? "bn" : "num-en"} ${
            isSunday ? "text-[color:var(--today-ring)]" : ""
          }`}
        >
          <AnimatedValue value={primaryDateLabel} />
        </span>
      </div>
    );
  }

  const event = events[index];
  const images = FESTIVAL_IMAGES[event.festival.id];
  const color = CATEGORY_COLOR[event.festival.category];
  const label = mode === "bn" ? event.festival.nameBn : event.festival.nameEn;

  return (
    <div
      key={event.festival.id}
      className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-0.5 pb-1.5 px-1 animate-fade-in"
      title={label}
    >
      {images ? (
        <div
          className="flex-1 w-full min-h-0 rounded-lg sm:rounded-xl p-1"
          style={{ backgroundColor: deepenColor(color), ["--festival-art-tint" as string]: "#000000" }}
        >
          <CyclingImage images={images} alt={label} className="h-full w-full" />
        </div>
      ) : (
        <span className="h-7 w-7 sm:h-9 sm:w-9 shrink-0" style={{ color }}>
          <FestivalIconGlyph icon={event.festival.icon} className="h-full w-full" />
        </span>
      )}
      <MarqueeText text={label} color={color} className="w-full text-[8px] sm:text-[10px] leading-tight bn px-0.5 shrink-0" />
    </div>
  );
}
