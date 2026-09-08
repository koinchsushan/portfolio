import { DIAGRAM_CAPTION, DIAGRAM_TITLE, splitGeometry, stageBuilt } from './geometry'
import { RampGradient } from './RampGradient'

const STAGE_COUNT = 3
const GRADIENT_ID = 'split-ramp'

/**
 * One bundled train, five independent lanes. The five pinstripe lines are
 * the same five lines throughout: packed tight inside the capsule they read
 * as one heavy track, fanned out past the split they read as five. Only the
 * fan itself sits inside the ramp's transformation zone, so it is the one
 * segment of each lane that actually shifts colour.
 */
export function SplitDiagram({ progress = 1, className }: { progress?: number; className?: string }) {
  const geo = splitGeometry()
  const ramp = `url(#${GRADIENT_ID})`
  const boundsX1 = geo.ramp.x1
  const boundsX2 = geo.ramp.x2
  const boundsTop = geo.splitRule.y1
  const boundsBottom = geo.splitRule.y2

  return (
    <svg
      viewBox={`0 0 ${geo.view.w} ${geo.view.h}`}
      data-progress={progress}
      role="img"
      className={`saturate-150 ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{DIAGRAM_TITLE.split}</title>
      <desc>{DIAGRAM_CAPTION.split}</desc>
      <defs>
        <RampGradient id={GRADIENT_ID} ramp={geo.ramp} tightness={0.45} />
      </defs>

      <g aria-hidden="true">
        <rect
          x={boundsX1}
          y={boundsTop}
          width={boundsX2 - boundsX1}
          height={boundsBottom - boundsTop}
          fill="none"
          stroke="var(--color-grid)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </g>

      <g data-stage="bundle" data-built={stageBuilt(progress, 0, STAGE_COUNT) ? 'true' : 'false'}>
        <rect
          x={geo.capsule.x}
          y={geo.capsule.y}
          width={geo.capsule.w}
          height={geo.capsule.h}
          fill="none"
          stroke="var(--color-grid)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {geo.releases.map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1={geo.capsule.y}
            y2={geo.capsule.y + geo.capsule.h}
            stroke="var(--color-grid)"
            strokeWidth={1}
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <text x={geo.capsule.x + geo.capsule.w / 2} y={geo.noteY} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={13} fill="var(--color-label)">
          One release train
        </text>
        {geo.lanes.map((lane) => (
          <path key={lane.laneY} d={lane.bundle} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      <g data-stage="split" data-built={stageBuilt(progress, 1, STAGE_COUNT) ? 'true' : 'false'}>
        <line
          x1={geo.splitRule.x}
          x2={geo.splitRule.x}
          y1={geo.splitRule.y1}
          y2={geo.splitRule.y2}
          stroke="var(--color-grid)"
          strokeWidth={1}
          strokeDasharray="2 4"
          vectorEffect="non-scaling-stroke"
        />
        {geo.lanes.map((lane) => (
          <path key={lane.laneY} d={lane.fan} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      <g data-stage="lanes" data-built={stageBuilt(progress, 2, STAGE_COUNT) ? 'true' : 'false'}>
        {geo.lanes.map((lane) => (
          <g key={lane.laneY}>
            <path d={lane.run} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            {lane.deploys.map((x) => (
              <line
                key={x}
                x1={x}
                x2={x}
                y1={lane.laneY - 6}
                y2={lane.laneY + 6}
                stroke="var(--color-label)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path d={lane.arrow} fill="none" stroke={ramp} strokeWidth={2} strokeLinejoin="miter" vectorEffect="non-scaling-stroke" />
            <text
              x={geo.labelX + 8}
              y={lane.laneY - 12}
              fontFamily="var(--font-mono)"
              fontSize={14}
              fill="var(--color-label)"
            >
              {lane.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
