/**
 * Five client marks, rendered as inline SVG monograms (not photo-accurate
 * brand logos). Attribution only, deliberately non-interactive: no anchors,
 * no hover affordance, no navigation. `fill="currentColor"` so each mark
 * inherits the row's --label colour.
 */
const marks: { name: string; glyph: string }[] = [
  { name: 'Viveka Health', glyph: 'VH' },
  { name: 'Proponent', glyph: 'PN' },
  { name: 'Javra Software', glyph: 'JV' },
  { name: 'Foundermatcha', glyph: 'FM' },
  { name: 'London Metropolitan University', glyph: 'LMU' },
]

function Monogram({ name, glyph }: { name: string; glyph: string }) {
  return (
    <svg
      viewBox="0 0 96 28"
      role="img"
      aria-label={name}
      className="h-[18px] w-auto text-label"
      fill="currentColor"
    >
      <text
        x="0"
        y="21"
        fontFamily="var(--font-mono, monospace)"
        fontSize="18"
        letterSpacing="0.02em"
      >
        {glyph}
      </text>
    </svg>
  )
}

export function LogoRow({ className = '' }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 items-center gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-5 ${className}`}
      aria-label="Client marks"
    >
      {marks.map((mark) => (
        <Monogram key={mark.name} {...mark} />
      ))}
    </div>
  )
}
