import { useEffect, useRef, useState, CSSProperties } from "react";

interface MarqueeTextProps {
  text: string;
  className?: string;
  color?: string;
}

/**
 * A single-line label that scrolls back and forth (like a phone's
 * marquee/ticker text) only when it's actually too long to fit its box,
 * so the full occasion name stays readable in the small calendar-cell
 * badges instead of getting cut off with an ellipsis.
 */
export default function MarqueeText({ text, className, color }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const measure = () => {
      const overflow = textEl.scrollWidth - container.clientWidth;
      setShift(overflow > 2 ? overflow : 0);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [text]);

  const style: CSSProperties & Record<string, string> = { color: color ?? "inherit" };
  if (shift > 0) {
    style["--marquee-shift"] = `-${shift}px`;
  }

  // While actually scrolling, any mid-transition frame otherwise hard-clips
  // the text at the box edge (looks like broken/cut text, e.g. a screenshot
  // catching "at Chandra Chattopa" instead of the full name) -- fading the
  // edges makes it read as text scrolling past a window instead.
  const containerStyle: CSSProperties | undefined =
    shift > 0
      ? {
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }
      : undefined;

  return (
    <div
      ref={containerRef}
      className={`flex overflow-hidden whitespace-nowrap ${shift > 0 ? "justify-start" : "justify-center"} ${className ?? ""}`}
      style={containerStyle}
    >
      <span
        ref={textRef}
        className={`inline-block ${shift > 0 ? "animate-marquee" : ""}`}
        style={style}
      >
        {text}
      </span>
    </div>
  );
}
