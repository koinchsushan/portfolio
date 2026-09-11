/**
 * Trajectory time axis: pure date parsing and layout maths, no JSX. Mirrors
 * the separation `geometry.ts` keeps for the case-study diagrams, for the
 * same reason: the numbers need to be unit-testable without touching the
 * DOM, and server and client have to land on byte-identical output.
 *
 * Every position this module produces is derived from a date already
 * committed to `src/content/roles.ts` or `education.ts`. Nothing here
 * hardcodes a pixel or a percentage against a specific entry; a changed CV
 * date reflows the whole axis on its own.
 */

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
}

export interface DateRange {
  start: Date
  end: Date
  current: boolean
}

/** Parses one side of a CV date range: "Mar 2022", "2018", or "Current". */
function parseBound(raw: string, edge: 'start' | 'end', now: Date): Date {
  const s = raw.trim()
  if (/^current$/i.test(s)) return now

  const monthYear = s.match(/^([A-Za-z]{3})[a-z]*\s+(\d{4})$/)
  if (monthYear) {
    const month = MONTHS[monthYear[1].toLowerCase()]
    const year = Number(monthYear[2])
    // Start-of-range dates land on the 1st of the month; end-of-range dates
    // land on that month's last day, so a role's bar covers the whole month
    // it began or finished in rather than a single instant inside it.
    return edge === 'start' ? new Date(year, month, 1) : new Date(year, month + 1, 0)
  }

  const yearOnly = s.match(/^(\d{4})$/)
  if (yearOnly) {
    const year = Number(yearOnly[1])
    return edge === 'start' ? new Date(year, 0, 1) : new Date(year, 11, 31)
  }

  throw new Error(`Trajectory: unparseable date "${raw}"`)
}

/** Parses a CV-style range, e.g. "Sep 2025 - Current" or "2018 - 2023". */
export function parseDateRange(dates: string, now: Date = new Date()): DateRange {
  const [rawStart, rawEnd] = dates.split(' - ')
  if (!rawStart || !rawEnd) throw new Error(`Trajectory: unparseable range "${dates}"`)
  const current = /^current$/i.test(rawEnd.trim())
  return {
    start: parseBound(rawStart, 'start', now),
    end: current ? now : parseBound(rawEnd, 'end', now),
    current,
  }
}

export interface TimelineEntry {
  key: string
  heading: string
  sub: string
  range: DateRange
}

export interface PositionedEntry extends TimelineEntry {
  lane: number
  startPct: number
  spanPct: number
}

export interface TimelineDomain {
  start: Date
  end: Date
}

/** The full span the axis has to cover: earliest start to latest end. */
export function timelineDomain(entries: TimelineEntry[]): TimelineDomain {
  const starts = entries.map((e) => e.range.start.getTime())
  const ends = entries.map((e) => e.range.end.getTime())
  return { start: new Date(Math.min(...starts)), end: new Date(Math.max(...ends)) }
}

function pct(date: Date, domain: TimelineDomain): number {
  const total = domain.end.getTime() - domain.start.getTime()
  if (total <= 0) return 0
  return ((date.getTime() - domain.start.getTime()) / total) * 100
}

/**
 * A piecewise-linear axis. Each stop pins one date to a chosen share of the
 * drawn width instead of its true linear share, and between stops the scale
 * is linear again, so the map stays continuous and strictly increasing:
 * dates that are ordered, or that overlap, stay ordered, or overlapping,
 * after the transform. Only proportional duration changes.
 *
 * Two kinds of stop. `break` ends the early years that carry a single entry
 * (drawn with a cut mark on the axis). `focus` is the Nepal-to-London move:
 * everything after it is the dense, overlapping recent work, and it gets the
 * far half of the axis. The dashed Nepal-to-London rule already marks that
 * point, so it carries no cut mark of its own.
 */
export interface AxisStop {
  date: Date
  rawPct: number
  screenPct: number
  kind: 'break' | 'focus'
}

export interface AxisScale {
  stops: AxisStop[]
}

/** Share of the drawn width given to everything before the early break: the
 *  years that carry a single entry. Enough to acknowledge they exist. */
const EARLY_SHARE = 12

/** Where the focus date lands. Everything after it (the move to London, and
 *  every overlapping role since) gets the remaining half of the width. It
 *  was about a quarter when only the pre-2022 years were compressed. */
const FOCUS_SHARE = 50

/**
 * Finds where the early break should pivot, from the data itself rather
 * than a fixed date: the start of the second entry to begin, chronologically,
 * floored to 1 Jan of that year. One entry alone before that point cannot
 * make a lopsided axis, so a break only ever appears once a second entry's
 * start actually creates one, and it always lands on a real change in the
 * data rather than an arbitrary constant.
 */
export function findAxisBreak(
  entries: TimelineEntry[],
  domain: TimelineDomain,
  preBreakShare: number = EARLY_SHARE,
): AxisStop | null {
  const starts = [...new Set(entries.map((e) => e.range.start.getTime()))].sort((a, b) => a - b)
  if (starts.length < 2) return null

  const breakDate = new Date(new Date(starts[1]).getFullYear(), 0, 1)
  const rawPct = pct(breakDate, domain)
  // A break only makes sense strictly inside the domain; at either edge it
  // would compress everything or nothing, so skip it rather than draw a
  // break that does nothing.
  if (rawPct <= 0 || rawPct >= 100) return null

  return { date: breakDate, rawPct, screenPct: preBreakShare, kind: 'break' }
}

/**
 * The axis scale: the early break, plus a focus stop at `focus` when one is
 * given. The focus stop is only added when it genuinely compresses, meaning
 * it lies inside the domain, after the early break, and its true position is
 * further right than the share it is pinned to. Anything else would stretch
 * the early years instead of the recent ones.
 */
export function buildAxisScale(
  entries: TimelineEntry[],
  domain: TimelineDomain,
  focus: Date | null = null,
): AxisScale | null {
  const stops: AxisStop[] = []
  const early = findAxisBreak(entries, domain)
  if (early) stops.push(early)

  if (focus) {
    const rawPct = pct(focus, domain)
    const prev = stops[stops.length - 1]
    const inside = rawPct > 0 && rawPct < 100
    const compresses = rawPct > FOCUS_SHARE
    const afterPrev = !prev || (rawPct > prev.rawPct && FOCUS_SHARE > prev.screenPct)
    if (inside && compresses && afterPrev) stops.push({ date: focus, rawPct, screenPct: FOCUS_SHARE, kind: 'focus' })
  }

  return stops.length > 0 ? { stops } : null
}

/** Maps a linear (raw) percent position onto the piecewise axis. */
function toScreenPct(rawPct: number, scale: AxisScale | null): number {
  if (!scale) return rawPct
  const points = [{ rawPct: 0, screenPct: 0 }, ...scale.stops, { rawPct: 100, screenPct: 100 }]
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    if (rawPct <= b.rawPct || i === points.length - 1) {
      return a.screenPct + ((rawPct - a.rawPct) / (b.rawPct - a.rawPct)) * (b.screenPct - a.screenPct)
    }
  }
  return rawPct
}

/**
 * Greedy interval-scheduling lane assignment, earliest start first: an
 * entry reuses the first lane whose last-placed entry has already ended by
 * the time this one starts, and only opens a new lane when every existing
 * lane is still occupied. Two entries land in different lanes exactly when
 * their date ranges truly overlap, which is the fact this axis exists to
 * show, so the lane count itself is evidence rather than a layout accident.
 */
export function assignLanes(entries: TimelineEntry[]): number[] {
  const order = entries
    .map((_, i) => i)
    .sort((a, b) => entries[a].range.start.getTime() - entries[b].range.start.getTime())

  const laneEnds: number[] = []
  const lanes = new Array<number>(entries.length)

  for (const i of order) {
    const entry = entries[i]
    let lane = laneEnds.findIndex((end) => end <= entry.range.start.getTime())
    if (lane === -1) {
      lane = laneEnds.length
      laneEnds.push(0)
    }
    laneEnds[lane] = entry.range.end.getTime()
    lanes[i] = lane
  }

  return lanes
}

export function positionEntries(
  entries: TimelineEntry[],
  domain: TimelineDomain,
  scale: AxisScale | null = null,
): PositionedEntry[] {
  const lanes = assignLanes(entries)
  return entries.map((entry, i) => {
    const startPct = toScreenPct(pct(entry.range.start, domain), scale)
    const endPct = toScreenPct(pct(entry.range.end, domain), scale)
    return { ...entry, lane: lanes[i], startPct, spanPct: Math.max(endPct - startPct, 0.5) }
  })
}

export interface YearTick {
  year: number
  pct: number
}

/** One tick per calendar year whose Jan 1 falls inside the domain. */
export function yearTicks(domain: TimelineDomain, scale: AxisScale | null = null): YearTick[] {
  const ticks: YearTick[] = []
  for (let year = domain.start.getFullYear(); year <= domain.end.getFullYear(); year++) {
    const jan1 = new Date(year, 0, 1).getTime()
    if (jan1 < domain.start.getTime() || jan1 > domain.end.getTime()) continue
    ticks.push({ year, pct: toScreenPct(pct(new Date(year, 0, 1), domain), scale) })
  }
  return ticks
}

/** True when two positioned entries' date ranges genuinely overlap. */
export function entriesOverlap(a: PositionedEntry, b: PositionedEntry): boolean {
  return a.range.start.getTime() < b.range.end.getTime() && b.range.start.getTime() < a.range.end.getTime()
}
