import type { FestivalIconKey } from "@bong/panjika-core";
import { Sun, Circle, CircleDashed, Moon, Flag, TreePine, Heart, BookOpen, Balloon, Palette, Cog, Cross, Egg, Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDove } from "@fortawesome/free-solid-svg-icons";

// A couple of extra glyph keys exist only for special-tithi badges (which
// aren't tied to a Festival record in core), so this is a superset of
// core's FestivalIconKey.
export type IconKey = FestivalIconKey | "ekadashi";

interface GlyphProps {
  className?: string;
}

// Icons that have a genuinely correct match in Lucide/Font Awesome render
// through those libraries. The rest are specific to Hindu deities or Bengali
// ritual objects (a diya, a rakhi thread, a tilak mark, a ratha/chariot) with
// no honest equivalent in a generic icon set -- those keep the original
// hand-drawn geometric symbol below rather than being forced into a
// mismatched substitute. See the PR/commit description for the full
// per-icon rationale.

function LucideFull({ Icon, className }: { Icon: typeof Sun; className?: string }) {
  return <Icon className={className} strokeWidth={2} absoluteStrokeWidth={false} style={{ width: "100%", height: "100%" }} />;
}

function SunGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Sun} className={className} />;
}

// Purnima (full moon) -- a filled disc is the standard "full moon" convention.
function MoonFull({ className }: GlyphProps) {
  return <Circle className={className} style={{ width: "100%", height: "100%" }} fill="currentColor" stroke="none" />;
}

// Amavasya (new moon) -- no icon set has a literal "invisible moon"; a faint
// dashed outline is the closest honest approximation of "barely there".
function MoonNewGlyph({ className }: GlyphProps) {
  return <CircleDashed className={className} strokeWidth={2} style={{ width: "100%", height: "100%" }} />;
}

// Islamic (Hijri) dates -- the crescent is the universal symbol for the
// lunar Hijri calendar, so Lucide's crescent-shaped Moon icon is a proper,
// not approximate, match here.
function CrescentGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Moon} className={className} />;
}

function FlagGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Flag} className={className} />;
}

// Christmas -- a conical evergreen is the standard "Christmas tree" glyph
// across icon sets (Lucide's plain Trees/TreeDeciduous read as generic
// foliage, not specifically Christmas).
function TreeGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={TreePine} className={className} />;
}

function HeartGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Heart} className={className} />;
}

// Peace/dove figures (Mother Teresa, Gandhi Jayanti) -- Lucide has no dove,
// only a generic Bird; Font Awesome's dove is the actual bird-of-peace shape.
function DoveGlyph({ className }: GlyphProps) {
  return <FontAwesomeIcon icon={faDove} className={className} style={{ width: "100%", height: "100%" }} />;
}

function BookGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={BookOpen} className={className} />;
}

function BalloonGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Balloon} className={className} />;
}

// Holi -- a paint palette is the standard "festival of colours" glyph.
function ColorsGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Palette} className={className} />;
}

function GearGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Cog} className={className} />;
}

function CrossGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Cross} className={className} />;
}

function EggGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Egg} className={className} />;
}

function StarGlyph({ className }: GlyphProps) {
  return <LucideFull Icon={Star} className={className} />;
}

// -- No proper library match exists for the icons below (deity portraits,
// and Bengali/Hindu ritual objects that aren't in any generic icon set) --
// these keep the original hand-drawn symbol. Every glyph here is a simple,
// original, hand-drawn geometric symbol (no traced or copied artwork) in a
// 100x100 viewBox, so it scales cleanly and tints via `currentColor`.

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
  sun: SunGlyph,
  "moon-full": MoonFull,
  "moon-new": MoonNewGlyph,
  ekadashi: Ekadashi,
  crescent: CrescentGlyph,
  diya: Diya,
  chariot: Chariot,
  flag: FlagGlyph,
  tree: TreeGlyph,
  heart: HeartGlyph,
  dove: DoveGlyph,
  book: BookGlyph,
  balloon: BalloonGlyph,
  colors: ColorsGlyph,
  gear: GearGlyph,
  cross: CrossGlyph,
  egg: EggGlyph,
  star: StarGlyph,
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
  const Glyph = GLYPHS[icon] ?? StarGlyph;
  return <Glyph className={className} />;
}
