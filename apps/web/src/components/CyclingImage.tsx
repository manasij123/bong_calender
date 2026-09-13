import { useEffect, useState } from "react";

interface CyclingImageProps {
  images: string[];
  alt: string;
  className?: string;
  intervalMs?: number;
}

/**
 * Shows one piece of line-art, or slowly crossfades between several (e.g.
 * Poila Boishakh's two pieces of art). Rendered as a CSS mask (rather than
 * a plain <img>) tinted via --festival-art-tint, so the same black-on-
 * transparent artwork can recolor to a light/purple tone in dark theme
 * without needing separate art files.
 */
export default function CyclingImage({ images, alt, className, intervalMs = 2800 }: CyclingImageProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div className={`relative ${className ?? ""}`} role="img" aria-label={alt}>
      {images.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out bg-[color:var(--festival-art-tint)]"
          style={{
            opacity: i === index ? 1 : 0,
            maskImage: `url(${src})`,
            WebkitMaskImage: `url(${src})`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
      ))}
    </div>
  );
}
