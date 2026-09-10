import { forwardRef } from 'react'
import { avoidScale, heroGeometry, type AvoidBox } from './geometry'
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
 *
 * `avoidBox`, in this SVG's own viewBox units, is a live-measured rectangle
 * around the one piece of real copy small and thin enough for the lattice to
 * visually collide with (the location/availability line and the two CTA
 * links, task-O finding 4): any dot or the terminal marker whose own circle
 * would overlap it is dropped from the render entirely, a true gap in the
 * point field rather than a mask painted over the words. `Hero` measures
 * that rectangle from the live DOM and passes it down; this component stays
 * a pure function of its props either way (`null` renders every point, the
 * same output as before this fix).
 */
export const HeroField = forwardRef<SVGSVGElement, { className?: string; avoidBox?: AvoidBox | null }>(
  function HeroField({ className, avoidBox }, ref) {
    const geo = heroGeometry()
    const ramp = `url(#${GRADIENT_ID})`

    const terminalScale = avoidScale(avoidBox, geo.terminal.x, geo.terminal.y)

    return (
      <svg
        ref={ref}
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
              stroke="var(--color-grid)"
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
          {geo.dots.map((dot, i) => {
            const scale = avoidScale(avoidBox, dot.x, dot.y)
            return (
              <circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r={(dot.weight / 2) * scale}
                fill={ramp}
                fillOpacity={dot.opacity * (0.4 + 0.6 * scale)}
              />
            )
          })}
        </g>

        <circle
          cx={geo.terminal.x}
          cy={geo.terminal.y}
          r={(geo.terminal.size / 2) * terminalScale}
          fill={ramp}
          fillOpacity={0.4 + 0.6 * terminalScale}
        />
      </svg>
    )
  },
)
