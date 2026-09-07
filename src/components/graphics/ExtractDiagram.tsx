import { DIAGRAM_CAPTION, DIAGRAM_TITLE, extractGeometry, stageBuilt } from './geometry'
import { RampGradient } from './RampGradient'

const STAGE_COUNT = 3
const GRADIENT_ID = 'extract-ramp'

/**
 * A ragged field of unstructured marks funnels down to a single throat and
 * fans back out into six aligned, gridded fields. The marks sit entirely
 * before the ramp's transformation zone (flat depth); the resolved key/value
 * boxes sit entirely after it (flat signal). Only the funnel and its
 * collector lines cross the zone and actually shift colour.
 */
export function ExtractDiagram({ progress = 1, className }: { progress?: number; className?: string }) {
  const geo = extractGeometry()
  const ramp = `url(#${GRADIENT_ID})`

  return (
    <svg
      viewBox={`0 0 ${geo.view.w} ${geo.view.h}`}
      data-progress={progress}
      role="img"
      className={`saturate-150 ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{DIAGRAM_TITLE.extract}</title>
      <desc>{DIAGRAM_CAPTION.extract}</desc>
      <defs>
        <RampGradient id={GRADIENT_ID} ramp={geo.ramp} />
      </defs>

      <g aria-hidden="true">
        <rect
          x={geo.ramp.x1}
          y={40}
          width={geo.ramp.x2 - geo.ramp.x1}
          height={320}
          fill="none"
          stroke="var(--color-grid)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </g>

      <g data-stage="field" data-built={stageBuilt(progress, 0, STAGE_COUNT) ? 'true' : 'false'}>
        {geo.marks.map((mark, i) => (
          <line
            key={i}
            x1={mark.x1}
            x2={mark.x2}
            y1={mark.y}
            y2={mark.y}
            stroke={ramp}
            strokeWidth={3}
            strokeOpacity={mark.opacity}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      <g data-stage="funnel" data-built={stageBuilt(progress, 1, STAGE_COUNT) ? 'true' : 'false'}>
        <path d={geo.funnel.top} fill="none" stroke={ramp} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />
        <path d={geo.funnel.bottom} fill="none" stroke={ramp} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />
        <path d={geo.funnel.throatTop} fill="none" stroke={ramp} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />
        <path d={geo.funnel.throatBottom} fill="none" stroke={ramp} strokeWidth={3.5} vectorEffect="non-scaling-stroke" />
        {geo.collectors.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={ramp} strokeWidth={3} vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      <g data-stage="fields" data-built={stageBuilt(progress, 2, STAGE_COUNT) ? 'true' : 'false'}>
        {geo.guides.map((guide) => (
          <line
            key={guide.x}
            x1={guide.x}
            x2={guide.x}
            y1={guide.y1}
            y2={guide.y2}
            stroke="var(--color-grid)"
            strokeWidth={1}
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {geo.fields.map((field) => (
          <g key={field.y}>
            <rect x={field.key.x} y={field.key.y} width={field.key.w} height={field.key.h} fill="none" stroke={ramp} strokeWidth={3} vectorEffect="non-scaling-stroke" />
            <rect x={field.cap.x} y={field.cap.y} width={field.cap.w} height={field.cap.h} fill={ramp} />
            <rect x={field.value.x} y={field.value.y} width={field.value.w} height={field.value.h} fill="none" stroke={ramp} strokeWidth={3} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>
    </svg>
  )
}
