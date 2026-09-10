import { heroGeometry } from './geometry'
import { RampGradient } from './RampGradient'

const GRADIENT_ID = 'hero-ramp'

/**
 * The hero's thesis at page scale: a 24x9 lattice where every dot has a
 * true position and the left-hand ones have not found it yet, plus a noisy
 * trace settling onto the datum it was always measuring. Purely decorative
 * relative to the hero's actual content (name, strapline, location, links),
 * so it stays out of the accessibility tree. `id="hero-field"` gives a
 * later WebGL pass a stable node to sit behind or replace; this markup is
 * also the reduced-motion fallback, so it has to stand on its own.
 */
export function HeroField({ className }: { className?: string }) {
  const geo = heroGeometry()
  const ramp = `url(#${GRADIENT_ID})`

  return (
    <svg
      id="hero-field"
      viewBox={`0 0 ${geo.view.w} ${geo.view.h}`}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className={`saturate-150 ${className ?? ''}`}
    >
      <defs>
        <RampGradient id={GRADIENT_ID} ramp={geo.ramp} />
      </defs>

      <g data-layer="columns">
        {geo.columns.map((column) => (
          <line
            key={column.x}
            x1={column.x}
            x2={column.x}
            y1={24}
            y2={geo.view.h - 24}
            stroke="var(--color-rule)"
            strokeOpacity={column.opacity}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      <line
        x1={geo.datum.x1}
        x2={geo.datum.x2}
        y1={geo.datum.y}
        y2={geo.datum.y}
        stroke={ramp}
        strokeWidth={2.5}
        vectorEffect="non-scaling-stroke"
      />

      <path d={geo.trace} fill="none" stroke={ramp} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />

      <g data-layer="lattice">
        {geo.dots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r={dot.weight / 2} fill={ramp} fillOpacity={dot.opacity} />
        ))}
      </g>

      <circle cx={geo.terminal.x} cy={geo.terminal.y} r={geo.terminal.size / 2} fill={ramp} />
    </svg>
  )
}
