import type { RampSpan } from './geometry'

/**
 * The depth -> signal ramp, shared by every diagram and the hero. Placed in
 * `userSpaceOnUse` coordinates so a stroke painted with it renders the right
 * colour purely from its own x position: unresolved geometry to the left of
 * the transition zone reads flat `--depth`, resolved geometry to the right
 * of it reads flat `--signal`, and only that zone actually ramps. The
 * colour change and the geometric change are the same event, so one
 * gradient id, applied uniformly, is all any diagram needs.
 *
 * `tightness` (0 to 1) narrows the ramp to the middle slice of `[ramp.start,
 * ramp.end]` without moving `ramp.start`/`ramp.end` themselves, so every
 * diagram's own aligned geometry never shifts. Default 1 keeps the full
 * span (the hero field's slow, page-scale resolve); the three case-study
 * diagrams pass a smaller value for a short, deliberate transition instead
 * of a rainbow tube (Task K).
 */
export function RampGradient({ id, ramp, tightness = 1 }: { id: string; ramp: RampSpan; tightness?: number }) {
  const span = ramp.x2 - ramp.x1
  const mid = (ramp.start + ramp.end) / 2
  const half = ((ramp.end - ramp.start) * tightness) / 2
  const tightStart = mid - half
  const tightEnd = mid + half
  const offsetStart = span === 0 ? 0 : (tightStart - ramp.x1) / span
  const offsetEnd = span === 0 ? 1 : (tightEnd - ramp.x1) / span

  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={ramp.x1} y1={0} x2={ramp.x2} y2={0}>
      <stop offset={0} stopColor="var(--color-depth)" />
      <stop offset={offsetStart} stopColor="var(--color-depth)" />
      <stop offset={offsetEnd} stopColor="var(--color-signal)" />
      <stop offset={1} stopColor="var(--color-signal)" />
    </linearGradient>
  )
}
