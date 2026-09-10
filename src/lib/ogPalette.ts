/**
 * The site's palette, duplicated here in raw hex for `next/og`'s
 * `ImageResponse` (Satori) alone: OG images render outside the DOM, in a
 * headless layout engine with no stylesheet and no CSS custom properties,
 * so the `var(--color-*)` tokens every component uses are not available to
 * it. These six values are transcribed verbatim from `src/styles/tokens.css`
 * and must be kept in sync with it by hand.
 *
 * Deliberately outside `src/components/` and `src/app/`: the project's own
 * "no raw hex in components" rule targets exactly the code those two
 * directories hold (see `tests/pages/render.test.tsx`), and this module is
 * the one place that rule does not apply, for exactly the reason above.
 */
export const OG_PALETTE = {
  ground: '#100e0c',
  panel: '#1e1a15',
  grid: '#3a332c',
  label: '#a79f96',
  bone: '#edeae9',
  signal: '#e3b23c',
} as const
