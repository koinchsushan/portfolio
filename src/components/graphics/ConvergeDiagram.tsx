import { DIAGRAM_CAPTION, DIAGRAM_TITLE, convergeGeometry, stageBuilt } from './geometry'
import { RampGradient } from './RampGradient'

const STAGE_COUNT = 3
const GRADIENT_ID = 'converge-ramp'

/**
 * Four in, one through, five out. Every flow-carrying line (input leads,
 * the converging curves, the spine, the diverging curves, output leads) is
 * stroked with the same ramp gradient, so each element's own x position is
 * what decides whether it reads dim and unresolved, amber, or mid-transition.
 */
export function ConvergeDiagram({ progress = 1, className }: { progress?: number; className?: string }) {
  const geo = convergeGeometry()
  const ramp = `url(#${GRADIENT_ID})`

  return (
    <svg
      viewBox={`0 0 ${geo.view.w} ${geo.view.h}`}
      data-progress={progress}
      role="img"
      className={`saturate-150 ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{DIAGRAM_TITLE.converge}</title>
      <desc>{DIAGRAM_CAPTION.converge}</desc>
      <defs>
        <RampGradient id={GRADIENT_ID} ramp={geo.ramp} tightness={0.45} />
      </defs>

      <g aria-hidden="true">
        <rect
          x={geo.bounds.x1}
          y={geo.bounds.top}
          width={geo.bounds.x2 - geo.bounds.x1}
          height={geo.bounds.bottom - geo.bounds.top}
          fill="none"
          stroke="var(--color-grid)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {geo.rules.map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1={geo.bounds.top}
            y2={geo.bounds.bottom}
            stroke="var(--color-grid)"
            strokeWidth={1}
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <text
          x={geo.bounds.x1}
          y={geo.bounds.top - 10}
          fontFamily="var(--font-mono)"
          fontSize={11}
          letterSpacing="0.04em"
          fill="var(--color-label)"
        >
          {String(geo.inputs.length).padStart(2, '0')} CHAT IMPLEMENTATIONS
        </text>
        <text
          x={geo.bounds.x2}
          y={geo.bounds.top - 10}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize={11}
          letterSpacing="0.04em"
          fill="var(--color-label)"
        >
          {String(geo.outputs.length).padStart(2, '0')} PRODUCT SURFACES
        </text>
        <text
          x={(geo.spine.x1 + geo.spine.x2) / 2}
          y={geo.spine.capBottom + 22}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={10}
          letterSpacing="0.04em"
          fill="var(--color-label)"
        >
          01 SHARED COMPONENT LAYER
        </text>
      </g>

      <g data-stage="inputs" data-built={stageBuilt(progress, 0, STAGE_COUNT) ? 'true' : 'false'}>
        {geo.inputs.map((input, i) => (
          <g key={input.y}>
            <path d={input.lead} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <path d={input.curve} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <rect x={input.marker.x} y={input.marker.y} width={input.marker.size} height={input.marker.size} fill={ramp} />
            <text
              x={input.marker.x}
              y={input.marker.y - 5}
              fontFamily="var(--font-mono)"
              fontSize={9}
              fill="var(--color-label)"
            >
              {`#${String(i + 1).padStart(2, '0')}`}
            </text>
          </g>
        ))}
      </g>

      <g data-stage="spine" data-built={stageBuilt(progress, 1, STAGE_COUNT) ? 'true' : 'false'}>
        <line x1={geo.spine.x1} x2={geo.spine.x1} y1={geo.spine.capTop} y2={geo.spine.capBottom} stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
        <line x1={geo.spine.x1} x2={geo.spine.x2} y1={geo.spine.y} y2={geo.spine.y} stroke={ramp} strokeWidth={4} vectorEffect="non-scaling-stroke" />
        <line x1={geo.spine.x2} x2={geo.spine.x2} y1={geo.spine.capTop} y2={geo.spine.capBottom} stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </g>

      <g data-stage="outputs" data-built={stageBuilt(progress, 2, STAGE_COUNT) ? 'true' : 'false'}>
        {geo.outputs.map((output, i) => (
          <g key={output.y}>
            <path d={output.curve} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <path d={output.lead} fill="none" stroke={ramp} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <rect x={output.marker.x} y={output.marker.y} width={output.marker.size} height={output.marker.size} fill={ramp} />
            <text
              x={output.marker.x + output.marker.size}
              y={output.marker.y - 5}
              textAnchor="end"
              fontFamily="var(--font-mono)"
              fontSize={9}
              fill="var(--color-label)"
            >
              {`#${String(i + 1).padStart(2, '0')}`}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}
