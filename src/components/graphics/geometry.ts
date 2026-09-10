/**
 * Diagram geometry. Pure functions and constants only, no JSX.
 *
 * Every diagram on this site draws the same move: unstructured input on the
 * left becoming structured, legible output on the right. The drawing rules are
 * shared so the three read as one family of instrument plates:
 *
 *   - one plot box per diagram, 40 units of gutter on each side
 *   - phase boundaries drawn as full-height construction rules in `--grid`
 *   - tracks leave and arrive dead flat, so fans stay parallel at both ends
 *   - stroke weights: 1 construction, 2 track, 4 heavy (device pixels, via
 *     vector-effect="non-scaling-stroke", so weights hold from 320px to 900px)
 *   - the unresolved -> signal ramp runs left to right in user space, tonal
 *     rather than two-hue, and its two hard stops sit exactly on the
 *     diagram's own transformation zone. The colour change and the
 *     geometric change are the same event.
 */

import type { DiagramId } from '@/content'

/* ------------------------------------------------------------------ */
/* Captions. Single source of truth: the SVG <desc> and the visible     */
/* <figcaption> on the case study page both read from here.             */
/* ------------------------------------------------------------------ */

export const DIAGRAM_CAPTION: Record<DiagramId, string> = {
  converge:
    'Four separate chat implementations converging into one shared component layer that feeds all five product surfaces.',
  split: 'A single coordinated release train splitting into five independently deploying module lanes.',
  extract: 'An unstructured stream of inbound email resolving into structured, quotable fields.',
}

export const DIAGRAM_TITLE: Record<DiagramId, string> = {
  converge: 'Four tracks into one spine into five',
  split: 'One release train into five independent lanes',
  extract: 'Unstructured marks into aligned fields',
}

/* ------------------------------------------------------------------ */
/* Numeric helpers                                                      */
/* ------------------------------------------------------------------ */

export interface Point {
  x: number
  y: number
}

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

export function smoothstep(value: number): number {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

/**
 * Deterministic PRNG. The irregular marks have to be byte-identical on the
 * server and in the browser or hydration reshuffles them, so nothing here
 * ever calls Math.random.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * A horizontal S-connector. Both control points sit on the midpoint x, so the
 * curve leaves and arrives perfectly flat: a fan of these stays parallel at
 * the fan's two ends and only bends in the middle.
 */
export function sConnector(x1: number, y1: number, x2: number, y2: number): string {
  const cx = Math.round((x1 + x2) / 2)
  return `M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`
}

/** Catmull-Rom through every point, emitted as cubic beziers. */
export function smoothPath(points: Point[]): string {
  if (points.length < 2) return ''
  let d = `M ${round(points[0].x)} ${round(points[0].y)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${round(c1.x)} ${round(c1.y)} ${round(c2.x)} ${round(c2.y)} ${round(p2.x)} ${round(p2.y)}`
  }
  return d
}

function round(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Stage k of n is built once `progress` has passed its share of the run.
 * Default progress is 1, so every stage is built and the diagram is static.
 */
export function stageBuilt(progress: number, index: number, count: number): boolean {
  return progress >= (index + 1) / count
}

/**
 * A rectangle in a diagram's own user-space units, used to keep a decorative
 * field (the hero lattice) clear of a piece of real text laid over it. The
 * caller derives this from measured DOM rects; this module only ever
 * consumes it, so it stays free of anything DOM-shaped.
 */
export interface AvoidBox {
  x: number
  y: number
  w: number
  h: number
}

/** True when a circle at (cx, cy) with radius r overlaps `box`, both in the
 *  same user-space units. Used to drop individual lattice points out of a
 *  live text region rather than painting over it. */
export function circleIntersectsBox(box: AvoidBox, cx: number, cy: number, r: number): boolean {
  return !(cx + r < box.x || cx - r > box.x + box.w || cy + r < box.y || cy - r > box.y + box.h)
}

/** Where the unresolved -> signal ramp turns over, in the diagram's own user space. */
export interface RampSpan {
  x1: number
  x2: number
  start: number
  end: number
}

/* ------------------------------------------------------------------ */
/* 01 converge: four in, one through, five out                          */
/* ------------------------------------------------------------------ */

export interface ConvergeGeometry {
  view: { w: number; h: number }
  axis: number
  ramp: RampSpan
  rules: number[]
  bounds: { x1: number; x2: number; top: number; bottom: number }
  inputs: { y: number; marker: { x: number; y: number; size: number }; lead: string; curve: string }[]
  spine: { x1: number; x2: number; y: number; capTop: number; capBottom: number }
  outputs: { y: number; curve: string; lead: string; marker: { x: number; y: number; size: number } }[]
}

export function convergeGeometry(): ConvergeGeometry {
  const view = { w: 960, h: 320 }
  const axis = 160

  // Four phase boundaries, evenly reasoned: the parallel run ends at 200, the
  // spine occupies 380..560, the fan-out flattens at 760.
  const xLeftEdge = 40
  const xLeadEnd = 200
  const xSpineStart = 380
  const xSpineEnd = 560
  const xFanFlat = 760
  const xRightEdge = 920

  // Inputs at pitch 80 about the axis; outputs at pitch 60. The outermost
  // input and the outermost output land on the same two rows (40 and 280),
  // so the whole figure reads inside one rectangle.
  const inputYs = [40, 120, 200, 280]
  const outputYs = [40, 100, 160, 220, 280]
  const size = 8

  return {
    view,
    axis,
    ramp: { x1: xLeftEdge, x2: xRightEdge, start: xSpineStart, end: xSpineEnd },
    rules: [xLeadEnd, xSpineStart, xSpineEnd, xFanFlat],
    bounds: { x1: xLeftEdge, x2: xRightEdge, top: 16, bottom: 304 },
    inputs: inputYs.map((y) => ({
      y,
      marker: { x: xLeftEdge, y: y - size / 2, size },
      lead: `M ${xLeftEdge + size} ${y} H ${xLeadEnd}`,
      curve: sConnector(xLeadEnd, y, xSpineStart, axis),
    })),
    spine: {
      x1: xSpineStart,
      x2: xSpineEnd,
      y: axis,
      capTop: axis - 18,
      capBottom: axis + 18,
    },
    outputs: outputYs.map((y) => ({
      y,
      curve: sConnector(xSpineEnd, axis, xFanFlat, y),
      lead: `M ${xFanFlat} ${y} H ${xRightEdge - size}`,
      marker: { x: xRightEdge - size, y: y - size / 2, size },
    })),
  }
}

/* ------------------------------------------------------------------ */
/* 02 split: one bundled train, five independent lanes                  */
/* ------------------------------------------------------------------ */

export interface SplitGeometry {
  view: { w: number; h: number }
  ramp: RampSpan
  capsule: { x: number; y: number; w: number; h: number }
  /** Aligned release rules inside the capsule: one train, one cut date. */
  releases: number[]
  splitRule: { x: number; y1: number; y2: number }
  lanes: {
    label: string
    bundleY: number
    laneY: number
    bundle: string
    fan: string
    run: string
    /** Deploy ticks, deliberately staggered: no two lanes share an x. */
    deploys: number[]
    arrow: string
  }[]
  labelX: number
  noteY: number
}

export function splitGeometry(): SplitGeometry {
  const view = { w: 960, h: 400 }
  const xLeftEdge = 40
  const xSplit = 312
  const xLaneFlat = 520
  const xRightEdge = 920

  // Five lines the whole way through. Bundled at pitch 14 they read as one
  // heavy track; fanned to pitch 72 they read as five. Same five lines: that
  // is the point of the drawing.
  const bundleYs = [172, 186, 200, 214, 228]
  const laneYs = [56, 128, 200, 272, 344]
  const labels = ['Mobile App', 'Eligibility', 'Claims', 'Remittance', 'Fraud']
  const deploys = [
    [600, 792],
    [656, 848],
    [584, 720],
    [688, 880],
    [628, 764],
  ]

  return {
    view,
    ramp: { x1: xLeftEdge, x2: xRightEdge, start: xSplit, end: xLaneFlat },
    capsule: { x: xLeftEdge, y: 164, w: xSplit - xLeftEdge, h: 72 },
    releases: [112, 224],
    splitRule: { x: xSplit, y1: 32, y2: 368 },
    labelX: xLaneFlat,
    noteY: 268,
    lanes: laneYs.map((laneY, i) => ({
      label: labels[i],
      bundleY: bundleYs[i],
      laneY,
      bundle: `M ${xLeftEdge + 16} ${bundleYs[i]} H ${xSplit}`,
      fan: sConnector(xSplit, bundleYs[i], xLaneFlat, laneY),
      run: `M ${xLaneFlat} ${laneY} H ${xRightEdge - 22}`,
      deploys: deploys[i],
      arrow: `M ${xRightEdge - 22} ${laneY - 8} L ${xRightEdge - 8} ${laneY} L ${xRightEdge - 22} ${laneY + 8}`,
    })),
  }
}

/* ------------------------------------------------------------------ */
/* 03 extract: a ragged field resolving into aligned key/value fields    */
/* ------------------------------------------------------------------ */

export interface ExtractGeometry {
  view: { w: number; h: number }
  ramp: RampSpan
  /** Irregular marks at a regular row pitch: unstructured content, ruled paper. */
  marks: { x1: number; x2: number; y: number; opacity: number }[]
  funnel: { top: string; bottom: string; throatTop: string; throatBottom: string }
  collectors: string[]
  /** The two vertical alignment axes every resolved field snaps to. */
  guides: { x: number; y1: number; y2: number }[]
  fields: {
    y: number
    key: { x: number; y: number; w: number; h: number }
    cap: { x: number; y: number; w: number; h: number }
    value: { x: number; y: number; w: number; h: number }
  }[]
}

export function extractGeometry(): ExtractGeometry {
  const view = { w: 960, h: 400 }
  const xLeftEdge = 48
  const xFieldEnd = 372
  const xThroat = 452
  const xThroatEnd = 476
  const xRowStart = 556
  const xKey = 572
  const xValue = 692
  const xRightEdge = 920

  const rand = mulberry32(20260907)
  const rows = 19
  const pitch = 17
  const alphas = [0.55, 0.75, 0.95]
  const marks: ExtractGeometry['marks'] = []
  for (let r = 0; r < rows; r++) {
    const y = 44 + r * pitch
    let x = xLeftEdge + rand() * 26
    while (x < 336) {
      const x2 = Math.min(x + 26 + rand() * 104, xFieldEnd)
      if (x2 - x > 14) marks.push({ x1: round(x), x2: round(x2), y, opacity: alphas[Math.floor(rand() * 3)] })
      x = x2 + 14 + rand() * 38
    }
  }

  // Six resolved rows at pitch 44, centred on 200. Key boxes all start at the
  // same x and are all the same width; value boxes all start at the same x and
  // vary in width, because real records vary in length. The alignment is the
  // whole argument, so both axes are drawn as construction rules underneath.
  const fieldYs = [90, 134, 178, 222, 266, 310]
  const valueWidths = [148, 204, 172, 220, 140, 192]
  const boxH = 24

  return {
    view,
    ramp: { x1: 40, x2: xRightEdge, start: xFieldEnd, end: xKey },
    marks,
    funnel: {
      top: `M ${xFieldEnd} 40 C 416 40 424 186 ${xThroat} 186`,
      bottom: `M ${xFieldEnd} 360 C 416 360 424 214 ${xThroat} 214`,
      throatTop: `M ${xThroat} 186 H ${xThroatEnd}`,
      throatBottom: `M ${xThroat} 214 H ${xThroatEnd}`,
    },
    collectors: fieldYs.map(
      (y) => `${sConnector(xThroatEnd, 200, xRowStart, y)} H ${xKey}`,
    ),
    guides: [
      { x: xKey, y1: 56, y2: 344 },
      { x: xValue, y1: 56, y2: 344 },
    ],
    fields: fieldYs.map((y, i) => ({
      y,
      key: { x: xKey, y: y - boxH / 2, w: 104, h: boxH },
      cap: { x: xKey, y: y - boxH / 2, w: 4, h: boxH },
      value: { x: xValue, y: y - boxH / 2, w: valueWidths[i], h: boxH },
    })),
  }
}

/* ------------------------------------------------------------------ */
/* Hero: the same argument at page scale                                */
/* ------------------------------------------------------------------ */

export interface HeroGeometry {
  view: { w: number; h: number }
  ramp: RampSpan
  datum: { y: number; x1: number; x2: number }
  /** 24 x 9 lattice. Every dot has a true position; the left ones have not
   *  found it yet. Same points throughout, so this is one idea, not two. */
  dots: { x: number; y: number; weight: number; opacity: number; column: number }[]
  /** Graticule columns materialising as the field resolves. */
  columns: { x: number; opacity: number }[]
  /** A noisy measurement settling onto the datum it was always measuring. */
  trace: string
  terminal: { x: number; y: number; size: number }
}

export function heroGeometry(): HeroGeometry {
  const view = { w: 1200, h: 620 }
  const cols = 24
  const rowCount = 9
  const x0 = 56
  const xPitch = 47
  const y0 = 70
  const yPitch = 60
  const lastX = x0 + (cols - 1) * xPitch
  const datumY = y0 + 4 * yPitch

  const resolve = (i: number) => smoothstep((i / (cols - 1) - 0.1) / 0.72)

  const rand = mulberry32(19981205)
  const dots: HeroGeometry['dots'] = []
  for (let i = 0; i < cols; i++) {
    const t = resolve(i)
    const slack = 1 - t
    for (let j = 0; j < rowCount; j++) {
      dots.push({
        x: round(x0 + i * xPitch + (rand() * 2 - 1) * 34 * slack),
        y: round(y0 + j * yPitch + (rand() * 2 - 1) * 38 * slack),
        weight: round(3.5 + 2.5 * t),
        opacity: round(0.55 + 0.45 * t),
        column: i,
      })
    }
  }

  const columns: HeroGeometry['columns'] = []
  for (let i = 0; i < cols; i += 3) {
    const t = resolve(i)
    if (t > 0.02) columns.push({ x: x0 + i * xPitch, opacity: round(t * 0.85) })
  }

  // Two out-of-phase sines plus a small seeded term: a signal, not a spike
  // train. Its amplitude is exactly the slack the lattice still has.
  const noise = mulberry32(31415)
  const trace = smoothPath(
    Array.from({ length: cols }, (_, i) => {
      const slack = 1 - resolve(i)
      const n = 0.55 * Math.sin(i * 0.9 + 1.3) + 0.3 * Math.sin(i * 2.3 + 0.4) + 0.15 * (noise() * 2 - 1)
      return { x: x0 + i * xPitch, y: datumY + n * 150 * slack }
    }),
  )

  return {
    view,
    ramp: { x1: x0, x2: lastX, start: x0 + 0.1 * (lastX - x0), end: x0 + 0.82 * (lastX - x0) },
    datum: { y: datumY, x1: x0, x2: lastX },
    dots,
    columns,
    trace,
    terminal: { x: lastX, y: datumY, size: 12 },
  }
}
