import { useEffect, useRef, useState } from "react";

interface AnimatedValueProps {
  value: string;
  className?: string;
  as?: "span" | "div";
}

/**
 * Crossfades a short text value whenever it changes -- used for Bengali
 * date/tithi numbers that differ between the ঐতিহ্যগত and আধুনিক panchang
 * systems, so switching the toggle transitions the affected numbers
 * instead of snapping. The old and new value are stacked in the same grid
 * cell (so the layout never shifts and there's never a blank frame)
 * while the old one slides up and fades out and the new one slides in
 * from below and fades in.
 */
export default function AnimatedValue({ value, className, as = "span" }: AnimatedValueProps) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<string | null>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (value === current) return;
    setPrevious(current);
    setCurrent(value);
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setPrevious(null), 300);
    return () => window.clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const Wrapper = as;
  return (
    <Wrapper className={`value-crossfade ${className ?? ""}`}>
      {previous !== null && (
        <span className="value-crossfade-old" aria-hidden="true">
          {previous}
        </span>
      )}
      <span className={previous !== null ? "value-crossfade-new" : undefined}>{current}</span>
    </Wrapper>
  );
}
