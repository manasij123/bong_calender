import { CSSProperties } from "react";

interface MaskIconProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders a black-on-transparent PNG as a CSS mask instead of a plain
 * <img>, so it tints via `currentColor` like the rest of the app's icons
 * (same technique CyclingImage.tsx uses for festival artwork) -- the PNG's
 * own color is ignored, only its alpha shape matters.
 */
export default function MaskIcon({ src, alt, className, style }: MaskIconProps) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-block bg-[color:currentColor] ${className ?? ""}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        ...style,
      }}
    />
  );
}
