import type { RampSpan } from './geometry'

/**
 * The depth -> signal ramp, shared by every diagram and the hero. Placed in
 * `userSpaceOnUse` coordinates so a stroke painted with it renders the right
 * colour purely from its own x position: unresolved geometry to the left of
 * `ramp.start` reads flat `--depth`, resolved geometry to the right of
 * `ramp.end` reads flat `--signal`, and only the transformation zone between
 * the two actually ramps. The colour change and the geometric change are the
 * same event, so one gradient id, applied uniformly, is all any diagram needs.
 */
export function RampGradient({ id, ramp }: { id: string; ramp: RampSpan }) {
  const span = ramp.x2 - ramp.x1
  const offsetStart = span === 0 ? 0 : (ramp.start - ramp.x1) / span
  const offsetEnd = span === 0 ? 1 : (ramp.end - ramp.x1) / span

  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={ramp.x1} y1={0} x2={ramp.x2} y2={0}>
      <stop offset={0} stopColor="var(--color-depth)" />
      <stop offset={offsetStart} stopColor="var(--color-depth)" />
      <stop offset={offsetEnd} stopColor="var(--color-signal)" />
      <stop offset={1} stopColor="var(--color-signal)" />
    </linearGradient>
  )
}
