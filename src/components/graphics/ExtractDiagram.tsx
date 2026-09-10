import { DIAGRAM_CAPTION, DIAGRAM_TITLE, extractGeometry, stageBuilt } from './geometry'
import { RampGradient } from './RampGradient'

const STAGE_COUNT = 3
const GRADIENT_ID = 'extract-ramp'

/**
 * A ragged field of unstructured marks funnels down to a single throat and
 * fans back out into six aligned, gridded fields. The marks sit entirely
 * before the ramp's transformation zone (flat, dim, unresolved); the
 * resolved key/value boxes sit entirely after it (flat signal). Only the
 * funnel and its collector lines cross the zone and actually shift colour.
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
        <RampGradient id={GRADIENT_ID} ramp={geo.ramp} tightness={0.45} />
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
        <text
          x={geo.ramp.x1}
          y={28}
          fontFamily="var(--font-mono)"
          fontSize={11}
          letterSpacing="0.04em"
          fill="var(--color-label)"
        >
          UNSTRUCTURED EMAIL STREAM
        </text>
        <text
          x={geo.ramp.x2}
          y={28}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize={11}
          letterSpacing="0.04em"
          fill="var(--color-label)"
        >
          {String(geo.fields.length).padStart(2, '0')} STRUCTURED QUOTE FIELDS
        </text>
        <text
          x={geo.guides[0].x}
          y={geo.guides[0].y1 - 8}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={9}
          letterSpacing="0.06em"
          fill="var(--color-label)"
        >
          KEY
        </text>
        <text
          x={geo.guides[1].x}
          y={geo.guides[1].y1 - 8}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={9}
          letterSpacing="0.06em"
          fill="var(--color-label)"
        >
          VALUE
        </text>
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
            strokeWidth={2}
            strokeOpacity={mark.opacity}
            strokeLinecap="square"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>

      <g data-stage="funnel" data-built={stageBuilt(progress, 1, STAGE_COUNT) ? 'true' : 'false'}>
        <path d={geo.funnel.top} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path d={geo.funnel.bottom} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path d={geo.funnel.throatTop} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <path d={geo.funnel.throatBottom} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {geo.collectors.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
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
        {geo.fields.map((field, i) => (
          <g key={field.y}>
            <text
              x={field.key.x - 8}
              y={field.y + 3}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize={9}
              fill="var(--color-label)"
            >
              {`#${String(i + 1).padStart(2, '0')}`}
            </text>
            <rect x={field.key.x} y={field.key.y} width={field.key.w} height={field.key.h} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <rect x={field.cap.x} y={field.cap.y} width={field.cap.w} height={field.cap.h} fill={ramp} />
            <rect x={field.value.x} y={field.value.y} width={field.value.w} height={field.value.h} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </g>
    </svg>
  )
}
