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

export function positionEntries(entries: TimelineEntry[], domain: TimelineDomain): PositionedEntry[] {
  const lanes = assignLanes(entries)
  return entries.map((entry, i) => {
    const startPct = pct(entry.range.start, domain)
    const endPct = pct(entry.range.end, domain)
    return { ...entry, lane: lanes[i], startPct, spanPct: Math.max(endPct - startPct, 0.5) }
  })
}

export interface YearTick {
  year: number
  pct: number
}

/** One tick per calendar year whose Jan 1 falls inside the domain. */
export function yearTicks(domain: TimelineDomain): YearTick[] {
  const ticks: YearTick[] = []
  for (let year = domain.start.getFullYear(); year <= domain.end.getFullYear(); year++) {
    const jan1 = new Date(year, 0, 1).getTime()
    if (jan1 < domain.start.getTime() || jan1 > domain.end.getTime()) continue
    ticks.push({ year, pct: pct(new Date(year, 0, 1), domain) })
  }
  return ticks
}

/** True when two positioned entries' date ranges genuinely overlap. */
export function entriesOverlap(a: PositionedEntry, b: PositionedEntry): boolean {
  return a.range.start.getTime() < b.range.end.getTime() && b.range.start.getTime() < a.range.end.getTime()
}
