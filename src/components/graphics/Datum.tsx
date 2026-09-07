/**
 * A fixed tick-and-datum mark: four short hairline ticks either side of one
 * taller centre datum, over a baseline. It never changes shape with the
 * value it sits above, on purpose. The three Position figures are readings
 * from three different instruments at wildly incomparable scales (union
 * members, emails per day, a bundle-size percentage), so the one honest way
 * to draw "these are instrument readings" is a mark that carries no data of
 * its own rather than a bar or ramp that would have to fake a shared scale.
 */
export function Datum({ className = '' }: { className?: string }) {
  const ticks = [0, 24, 48, 72, 96]
  return (
    <svg viewBox="0 0 96 12" aria-hidden="true" preserveAspectRatio="none" className={className}>
      <line
        x1={0}
        y1={11}
        x2={96}
        y2={11}
        stroke="var(--color-grid)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {ticks.map((x) => (
        <line
          key={x}
          x1={x}
          y1={x === 48 ? 0 : 6}
          x2={x}
          y2={11}
          stroke="var(--color-grid)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
