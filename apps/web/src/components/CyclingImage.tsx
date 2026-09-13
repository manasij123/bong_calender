import { useEffect, useState } from "react";

interface CyclingImageProps {
  images: string[];
  alt: string;
  className?: string;
  intervalMs?: number;
}

/** Shows one image, or slowly crossfades between several (e.g. Poila Boishakh's two pieces of art). */
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
    <div className={`relative ${className ?? ""}`}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === index ? alt : ""}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
