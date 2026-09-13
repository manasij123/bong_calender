import type { FestivalIconKey } from "@bong/panjika-core";

// A couple of extra glyph keys exist only for special-tithi badges (which
// aren't tied to a Festival record in core), so this is a superset of
// core's FestivalIconKey.
export type IconKey = FestivalIconKey | "ekadashi";

interface GlyphProps {
  className?: string;
}

// Every glyph is a simple, original, hand-drawn geometric symbol (no traced
// or copied artwork) in a 100x100 viewBox, so it scales cleanly and tints
// via `currentColor` for theme-awareness. A couple (flag, colors/holi) use
// fixed accent colors since they're inherently multi-coloured motifs.

function Sun({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="18" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="22"
          x2="50"
          y2="34"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
    </svg>
  );
}

function MoonFull({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="27" fill="currentColor" />
      <circle cx="40" cy="42" r="4" fill="currentColor" opacity="0.35" />
      <circle cx="59" cy="56" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="46" cy="60" r="2.2" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function MoonNew({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M60 22 A28 28 0 1 0 60 78 A21 21 0 1 1 60 22 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Ekadashi({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M58 20 A30 30 0 1 0 58 80 A22 22 0 1 1 58 20 Z"
        fill="currentColor"
      />
      <circle cx="78" cy="50" r="5" fill="currentColor" />
    </svg>
  );
}

function Diya({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M18 62 Q50 82 82 62 L74 72 Q50 88 26 72 Z" fill="currentColor" />
      <path
        d="M50 18 C 38 34, 36 48, 50 60 C 64 48, 62 34, 50 18 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Chariot({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M30 38 L50 16 L70 38 Z" fill="currentColor" />
      <rect x="22" y="38" width="56" height="28" rx="4" fill="currentColor" />
      <circle cx="32" cy="74" r="11" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="68" cy="74" r="11" fill="none" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}

function Flag({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="28" y="12" width="5" height="76" fill="currentColor" />
      <rect x="33" y="16" width="38" height="9.5" fill="#f0a04b" />
      <rect x="33" y="25.5" width="38" height="9.5" fill="#f4f2ee" />
      <rect x="33" y="35" width="38" height="9.5" fill="#3f9e6d" />
      <circle cx="52" cy="30.25" r="3" fill="none" stroke="#2a4d8f" strokeWidth="1" />
    </svg>
  );
}

function Tree({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50 10 L4 4 3 6 h32 Z" fill="none" />
      <path d="M50 14 L63 36 H37 Z" fill="currentColor" />
      <path d="M50 30 L68 58 H32 Z" fill="currentColor" />
      <path d="M50 48 L72 82 H28 Z" fill="currentColor" />
      <rect x="45" y="82" width="10" height="9" fill="currentColor" />
      <path d="M50 4 L53.5 11 L46.5 11 Z" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function Heart({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M50 84 C22 63 8 45 8 28 C8 12 24 4 38 14 C44 18 48 24 50 28 C52 24 56 18 62 14 C76 4 92 12 92 28 C92 45 78 63 50 84 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Dove({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M16 58 C 30 42 50 44 58 32 C 57 42 62 46 74 43 C 66 54 54 57 44 53 C 40 63 28 68 14 66 C 24 61 27 58 16 58 Z"
        fill="currentColor"
      />
      <circle cx="60" cy="34" r="2.4" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function Book({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M50 26 C40 19 25 19 16 24 V72 C25 67 40 67 50 74 C60 67 75 67 84 72 V24 C75 19 60 19 50 26 Z"
        stroke="currentColor"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />
      <line x1="50" y1="26" x2="50" y2="74" stroke="currentColor" strokeWidth="4.5" />
    </svg>
  );
}

function Balloon({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <ellipse cx="50" cy="36" rx="22" ry="26" fill="currentColor" />
      <path d="M45 62 L50 70 L55 62 Z" fill="currentColor" />
      <path d="M50 70 C 45 78, 56 82, 50 92" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

function Colors({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <circle cx="32" cy="36" r="11" fill="#d9564d" />
      <circle cx="63" cy="28" r="9" fill="#4a8fd9" />
      <circle cx="72" cy="58" r="10" fill="#e0b93f" />
      <circle cx="40" cy="68" r="9" fill="#4fae72" />
      <circle cx="54" cy="50" r="8" fill="#a869d1" />
    </svg>
  );
}

function Gear({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="46"
          y="10"
          width="8"
          height="18"
          rx="2"
          fill="currentColor"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="20" fill="currentColor" />
      <circle cx="50" cy="50" r="9" fill="currentColor" opacity="0" stroke="none" />
      <circle cx="50" cy="50" r="9" className="[fill:var(--bg-elevated)]" />
    </svg>
  );
}

function Cross({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <rect x="42" y="12" width="16" height="76" rx="3" fill="currentColor" />
      <rect x="20" y="34" width="60" height="16" rx="3" fill="currentColor" />
    </svg>
  );
}

function Egg({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M50 8 C30 8 18 44 18 62 C18 81 32 92 50 92 C68 92 82 81 82 62 C82 44 70 8 50 8 Z"
        fill="currentColor"
      />
      <path
        d="M30 48 L42 56 L37 66 L52 60 L47 74"
        className="[stroke:var(--bg-elevated)]"
        strokeWidth="3.5"
      />
    </svg>
  );
}

function Star({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M50 6 L61.5 37.5 L95 38.5 L68.5 59 L78 91 L50 71.5 L22 91 L31.5 59 L5 38.5 L38.5 37.5 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Rakhi({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="7" />
      <circle cx="50" cy="50" r="9" fill="currentColor" />
      {Array.from({ length: 6 }).map((_, i) => (
        <circle
          key={i}
          cx="50"
          cy="20"
          r="3"
          fill="currentColor"
          transform={`rotate(${i * 60} 50 50)`}
        />
      ))}
    </svg>
  );
}

function Tilak({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M50 18 C 64 40 68 56 50 76 C 32 56 36 40 50 18 Z"
        fill="currentColor"
      />
      <circle cx="50" cy="34" r="4" className="[fill:var(--bg-elevated)]" opacity="0.5" />
    </svg>
  );
}

function Shiva({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <line x1="50" y1="18" x2="50" y2="88" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M50 18 L38 34 M50 18 L62 34 M50 10 L50 34" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 22 A15 15 0 1 1 22 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Krishna({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <path
        d="M50 92 C 44 60 34 38 50 12 C 66 38 56 60 50 92 Z"
        fill="currentColor"
      />
      <circle cx="50" cy="30" r="9" className="[fill:var(--bg-elevated)]" opacity="0.55" />
      <circle cx="50" cy="30" r="4" fill="currentColor" />
    </svg>
  );
}

function Ganesh({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <ellipse cx="26" cy="40" rx="11" ry="15" fill="currentColor" />
      <ellipse cx="74" cy="40" rx="11" ry="15" fill="currentColor" />
      <circle cx="50" cy="44" r="21" fill="currentColor" />
      <path
        d="M50 58 C 46 70 40 78 46 88 C 50 84 50 90 55 87"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Saraswati({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path
        d="M14 68 C 26 50 38 58 44 46 C 48 38 54 34 66 36 L58 41 C 65 41 72 45 75 52 C 64 49 55 53 50 62 C 43 76 26 76 14 68 Z"
        fill="currentColor"
      />
      <circle cx="67" cy="38" r="2.4" className="[fill:var(--bg-elevated)]" />
    </svg>
  );
}

function Lakshmi({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <g fill="currentColor">
        {[0, 45, 90, 135, -45].map((rot) => (
          <ellipse key={rot} cx="50" cy="38" rx="8" ry="17" transform={`rotate(${rot} 50 38)`} />
        ))}
      </g>
      <circle cx="50" cy="38" r="6" className="[fill:var(--bg-elevated)]" />
      <circle cx="37" cy="68" r="4.5" fill="currentColor" />
      <circle cx="50" cy="72" r="4.5" fill="currentColor" />
      <circle cx="63" cy="68" r="4.5" fill="currentColor" />
    </svg>
  );
}

function Kali({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <circle cx="50" cy="54" r="27" fill="currentColor" />
      <ellipse cx="39" cy="50" rx="6" ry="9" className="[fill:var(--bg-elevated)]" />
      <ellipse cx="61" cy="50" rx="6" ry="9" className="[fill:var(--bg-elevated)]" />
      <path d="M50 14 C 43 25 43 34 50 41 C 57 34 57 25 50 14 Z" fill="currentColor" />
    </svg>
  );
}

function Durga({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <path d="M50 8 L59 26 L50 21 L41 26 Z" fill="currentColor" />
      <path
        d="M12 46 C 28 32 44 38 50 47 C 56 38 72 32 88 46 C 75 62 60 60 50 51 C 40 60 25 62 12 46 Z"
        fill="currentColor"
      />
      <circle cx="50" cy="48" r="4.5" fill="currentColor" />
    </svg>
  );
}

const GLYPHS: Record<IconKey, (p: GlyphProps) => JSX.Element> = {
  sun: Sun,
  "moon-full": MoonFull,
  "moon-new": MoonNew,
  ekadashi: Ekadashi,
  diya: Diya,
  chariot: Chariot,
  flag: Flag,
  tree: Tree,
  heart: Heart,
  dove: Dove,
  book: Book,
  balloon: Balloon,
  colors: Colors,
  gear: Gear,
  cross: Cross,
  egg: Egg,
  star: Star,
  rakhi: Rakhi,
  tilak: Tilak,
  shiva: Shiva,
  krishna: Krishna,
  ganesh: Ganesh,
  saraswati: Saraswati,
  lakshmi: Lakshmi,
  kali: Kali,
  durga: Durga,
};

interface FestivalIconGlyphProps {
  icon: IconKey;
  className?: string;
}

export default function FestivalIconGlyph({ icon, className }: FestivalIconGlyphProps) {
  const Glyph = GLYPHS[icon] ?? Star;
  return <Glyph className={className} />;
}
