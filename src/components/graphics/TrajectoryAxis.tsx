import type { CSSProperties } from 'react'
import type { Education, Role } from '@/content'
import {
  buildAxisScale,
  parseDateRange,
  positionEntries,
  timelineDomain,
  yearTicks,
  type PositionedEntry,
  type DateRange,
  type TimelineEntry,
} from './timeline'

/** Years only. The bars carry the precision; this is the readable summary. */
function yearSpan(range: DateRange): string {
  const from = range.start.getFullYear()
  const to = range.current ? 'now' : String(range.end.getFullYear())
  return String(from) === to ? String(from) : `${from} to ${to}`
}

/**
 * The one fact a bulleted list cannot show: these roles and this masters
 * overlap in real time. Every x-position below comes from `parseDateRange`
 * reading the same `dates` strings the lists underneath already render, so
 * a changed CV date moves the axis instead of silently disagreeing with it.
 *
 * Orientation swap: each positioned element carries its date-derived
 * position as two CSS custom properties, `--pos` and `--span` (percentages
 * of its own containing box). Which physical axis those percentages drive
 * is decided purely by Tailwind's `md:` breakpoint (768px, matching the
 * brief) inside the class strings below, so the same numbers produce a
 * horizontal axis at desktop width and a vertical one on a phone, with no
 * extra JS and no squashing.
 */

// Lane slot (the axis's cross dimension): stacked rows at md+, side-by-side
// columns below it.
const LANE_CLASS =
  'absolute left-[var(--pos)] top-0 h-full w-[var(--span)] md:left-0 md:top-[var(--pos)] md:h-[var(--span)] md:w-full'

// A role/education bar (the axis's time dimension): a fixed-thickness mark
// whose length is the only thing the dates actually determine, exactly like
// stroke-width staying constant while geometry varies in `geometry.ts`. Its
// colour is the one real piece of data this component adds on top of
// position: `current` (already parsed from the CV date string, never
// invented) reads as resolved --signal, and every closed period reads as
// dim --label, the tonal ramp's own "unresolved" end.
//
// At md+ the bar sits at the bottom of its lane, not the middle: the label
// runs along the top, and centring the bar left a label's descenders
// touching it.
const BAR_CLASS =
  'absolute left-0 top-[var(--pos)] h-[var(--span)] w-2 md:left-[var(--pos)] md:top-auto md:bottom-2.5 md:h-2 md:w-[var(--span)]'

// At md+ a label is one line, never wrapped, and starts 6px in from its
// bar's start. A 9rem cap used to wrap "London Metropolitan University" onto
// a second line that landed on its own bar, and a label starting exactly at
// its bar's start sat on top of the dashed Nepal-to-London rule.
const LABEL_CLASS =
  'absolute hidden left-4 top-[var(--pos)] max-w-[7.5rem] font-mono text-12 leading-tight text-label md:block md:left-[var(--pos)] md:top-0 md:ml-1.5 md:max-w-none md:whitespace-nowrap md:pt-0.5'

// An entry whose bar starts past NEAR_END_THRESHOLD gets this instead: same
// anchor point, but the label is pulled back over its own start with a
// transform (bottom-anchored below md, right-anchored at md+) so it grows
// inward, toward the middle of the plot, rather than outward past the
// frame. Anchoring with a transform keeps the anchor point itself, --pos,
// identical to the plain label, so it is still exactly where the bar
// starts , only the direction the text grows from flips.
const LABEL_CLASS_END =
  'absolute hidden left-4 top-[var(--pos)] max-w-[7.5rem] -translate-y-full font-mono text-12 leading-tight text-label md:block md:left-[var(--pos)] md:top-0 md:max-w-none md:whitespace-nowrap md:translate-y-0 md:-translate-x-full md:pr-1.5 md:pt-0.5 md:text-right'

// Past this point a start-anchored label's max-width would carry it past
// the plot's far edge on any width this axis actually renders at; entries
// starting later than this anchor from their end instead (see
// LABEL_CLASS_END). A position, not a per-entry constant: every entry is
// tested against the same threshold, whichever ones end up past it.
const NEAR_END_THRESHOLD = 80

// An entry that starts closer than this to the Nepal-to-London line, and
// ends before it, anchors its label to its own bar's end instead, reading
// leftward. Labels are single-line, so a start-anchored one that close ran
// across the dashed line at narrower widths (Viveka Services at 1024px).
// Anchored at the end, it stays on its own side of the line at any width.
const FOCUS_LABEL_ROOM = 12

const TICK_LINE_CLASS =
  'absolute left-0 right-0 top-[var(--pos)] h-px bg-grid md:top-0 md:bottom-0 md:right-auto md:left-[var(--pos)] md:h-full md:w-px'

const TICK_LABEL_CLASS =
  'absolute left-1.5 top-[var(--pos)] font-mono text-12 text-label md:left-[var(--pos)] md:top-auto md:bottom-0 md:ml-1'

// One small uppercase mono label per track, drawn in a header strip that is
// its own reserved slot in the cross axis (see computeTrackLayout below),
// never a lane an entry could ever be positioned into. That holds no matter
// where an entry's own --pos lands, including an entry starting at exactly
// 0 percent, because the header occupies space entry lanes are never given
// in the first place, in both orientations: it fills the whole strip, top
// to bottom below md (a column header above a vertical lane) and reads
// vertically there so a narrow column still contains it; at md+ it reads
// normally along the top of a horizontal row.
const TRACK_LABEL_CLASS =
  'pointer-events-none absolute inset-0 flex items-center overflow-hidden px-1 [writing-mode:vertical-lr] font-mono text-12 uppercase tracking-[0.08em] text-label md:items-start md:px-1.5 md:pt-1 md:[writing-mode:horizontal-tb]'

// The Nepal-to-London marker: a dashed rule in dim --label (never --signal,
// that budget is spent elsewhere on the page) crossing every track at once.
// --label is the tonal ramp's "unresolved" colour, and this line marks
// exactly the point the record moves from an earlier country to the current
// one, so the colour carries the same meaning here as it does inside the
// diagrams.
const MARKER_LINE_CLASS =
  'absolute left-0 right-0 top-[var(--pos)] border-t border-dashed border-label md:top-0 md:bottom-0 md:right-auto md:left-[var(--pos)] md:border-t-0 md:border-l md:h-full'

//
// Below md it sits just under the dashed line, inside the year column, and
// may wrap to two short lines there. Above the line it collided with the
// '25 tick label and ran across the end of the Viveka bar once the axis gave
// the recent years half the height.
const MARKER_LABEL_CLASS =
  'absolute left-1.5 top-[var(--pos)] mt-1 max-w-[3rem] font-mono text-12 leading-tight text-label md:left-[var(--pos)] md:top-0 md:mt-0 md:ml-1.5 md:max-w-none md:whitespace-nowrap'

// The axis break: two short tilted strokes centred on the tick lane at the
// break point, the standard double-slash cut mark for a compressed axis, so
// the compression is declared rather than hidden. Deliberately a small mark
// on the axis itself, not a rule crossing every track , that reads as a
// second Nepal-to-London marker, which is a dashed line spanning the whole
// plot on purpose.
//
// At md+ it sits at the top of the tick lane and the year labels run along
// the bottom; centred, it overlapped the label of the very year it marks. The
// tick lane is weighted tall enough to hold both (see TICK_WEIGHT). Below md
// it sits at the right of the year column, clear of the labels on the left.
const AXIS_BREAK_CLASS =
  'absolute left-0 right-0 top-[var(--pos)] flex items-center justify-end gap-1 pr-1.5 md:top-0 md:bottom-0 md:left-[var(--pos)] md:right-auto md:flex-col md:justify-start md:pr-0 md:pt-1'

const AXIS_BREAK_TICK_CLASS = 'h-3 w-px rotate-[20deg] bg-label md:h-px md:w-3'

type AxisVars = CSSProperties & { '--pos'?: string; '--span'?: string }

function posVar(pos: number, span?: number): AxisVars {
  return span === undefined ? { '--pos': `${pos}%` } : { '--pos': `${pos}%`, '--span': `${span}%` }
}

function computeSlots(weights: number[]): { pos: number; span: number }[] {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let cursor = 0
  return weights.map((weight) => {
    const span = (weight / total) * 100
    const slot = { pos: cursor, span }
    cursor += span
    return slot
  })
}

/** Resolved (still running) reads --signal; every closed period reads dim --label.
 *  Three distinct fill treatments, one per track, so the overlap between
 *  commercial work, research and education reads from shape alone, not
 *  colour alone (the tonal ramp still carries current-vs-closed). */
function barToneClass(current: boolean): string {
  return current ? 'bg-signal' : 'bg-label'
}

function barHatchClass(current: boolean): string {
  return current
    ? 'bg-[repeating-linear-gradient(135deg,var(--color-signal)_0px,var(--color-signal)_2px,transparent_2px,transparent_5px)]'
    : 'bg-[repeating-linear-gradient(135deg,var(--color-label)_0px,var(--color-label)_2px,transparent_2px,transparent_5px)]'
}

function barOutlineClass(current: boolean): string {
  return current ? 'border-2 border-signal bg-transparent' : 'border-2 border-label bg-transparent'
}

/** The one role in `roles` that is research rather than commercial work,
 *  identified the same way the axis identifies the Nepal-to-London move:
 *  by matching a name already present in the CV data, never invented. */
const RESEARCH_ORG = 'London Metropolitan University'


function laneCount(entries: PositionedEntry[]): number {
  return entries.length === 0 ? 0 : Math.max(...entries.map((e) => e.lane)) + 1
}

export function TrajectoryAxis({ roles, education }: { roles: Role[]; education: Education[] }) {
  const now = new Date()

  // Three tracks, not two: research (the London Metropolitan University
  // role) reads as its own lane rather than folded in with paid commercial
  // work, so the genuine overlap between Foundermatcha, the research role
  // and the MSc is legible as three distinguishable shapes, not one.
  const commercialRoles = roles.filter((r) => r.org !== RESEARCH_ORG)
  const researchRoles = roles.filter((r) => r.org === RESEARCH_ORG)

  const toEntry = (key: string, heading: string, sub: string, dates: string): TimelineEntry => ({
    key,
    heading,
    sub,
    range: parseDateRange(dates, now),
  })

  const commercialEntries: TimelineEntry[] = commercialRoles.map((r) => toEntry(r.org, r.title, r.org, r.dates))
  const researchEntries: TimelineEntry[] = researchRoles.map((r) => toEntry(r.org, r.title, r.org, r.dates))
  const eduEntries: TimelineEntry[] = education.map((e) => toEntry(e.institution, e.award, e.institution, e.dates))

  const allEntries = [...commercialEntries, ...researchEntries, ...eduEntries]
  const domain = timelineDomain(allEntries)

  // Most of the axis's content, the three genuinely overlapping spans it
  // exists to show, lands after the move to London; a linear scale gave that
  // stretch about a quarter of the width. So the axis compresses in two
  // steps: the early years carrying a single entry (the BSc) hardest, then
  // everything up to the move, which is pinned to the halfway point. The
  // move is read from the data, the first entry naming a London institution,
  // exactly as the Nepal-to-London marker below is. Every position passes
  // through the same scale, so ordering and overlaps survive exactly.
  const londonStart = eduEntries.find((e) => e.sub.includes('London'))?.range.start ?? null
  const scale = buildAxisScale(allEntries, domain, londonStart)
  const earlyBreak = scale?.stops.find((stop) => stop.kind === 'break') ?? null
  const focusStop = scale?.stops.find((stop) => stop.kind === 'focus') ?? null

  const commercialPositioned = positionEntries(commercialEntries, domain, scale)
  const researchPositioned = positionEntries(researchEntries, domain, scale)
  const eduPositioned = positionEntries(eduEntries, domain, scale)
  const ticks = yearTicks(domain, scale)

  const commercialLanes = laneCount(commercialPositioned)
  const researchLanes = laneCount(researchPositioned)
  const eduLanes = laneCount(eduPositioned)

  // Tick row reads thinner than a data lane; every track lane is equal
  // weight so bars read at the same scale across all three tracks. Each
  // track also reserves a header slot, sized for one line of mono-12 text,
  // that carries only its name , never an entry, at any zoom, in either
  // orientation, because entries are only ever placed into a lane slot.
  // 0.9, not the former 0.55, so the year labels and the cut mark above them
  // each get their own band of the tick lane instead of overlapping. The
  // chart is 1rem taller to match, which keeps every data lane at its old
  // height.
  const TICK_WEIGHT = 0.9
  const TRACK_HEADER_WEIGHT = 0.6

  const trackDefs = [
    { name: 'Commercial', positioned: commercialPositioned, bar: barToneClass, lanes: commercialLanes },
    { name: 'Research', positioned: researchPositioned, bar: barHatchClass, lanes: researchLanes },
    { name: 'Education', positioned: eduPositioned, bar: barOutlineClass, lanes: eduLanes },
  ].filter((track) => track.lanes > 0)

  const slots = computeSlots([
    TICK_WEIGHT,
    ...trackDefs.flatMap((track) => [TRACK_HEADER_WEIGHT, ...Array(track.lanes).fill(1)]),
  ])
  const tickSlot = slots[0]

  let cursor = 1
  const tracks = trackDefs.map((track) => {
    const headerSlot = slots[cursor]
    cursor += 1
    const laneSlots = slots.slice(cursor, cursor + track.lanes)
    cursor += track.lanes
    return { ...track, headerSlot, laneSlots }
  })

  // London Metropolitan University is, by its own name, a London
  // institution: the earliest entry that names it is the one genuine point
  // in this dataset where the record shifts from Nepal (Tribhuvan
  // University) to the UK. Derived from the content, not invented.
  const londonEntry = eduPositioned.find((e) => e.sub.includes('London'))

  const focusPct = focusStop?.screenPct ?? null
  function labelAnchor(entry: PositionedEntry): { className: string; pos: number } {
    if (entry.startPct >= NEAR_END_THRESHOLD) return { className: LABEL_CLASS_END, pos: entry.startPct }
    const endPct = entry.startPct + entry.spanPct
    if (focusPct !== null && endPct <= focusPct && focusPct - entry.startPct < FOCUS_LABEL_ROOM) {
      return { className: LABEL_CLASS_END, pos: endPct }
    }
    return { className: LABEL_CLASS, pos: entry.startPct }
  }

  const domainLabel = `${domain.start.getFullYear()} to present`

  const axisDescription = focusStop
    ? `the years before the ${focusStop.date.getFullYear()} move to London are compressed so the overlapping recent periods stay readable; those overlaps are real`
    : `drawn to scale so overlapping periods overlap on the axis`

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-12 text-label">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-2 w-5 bg-label" /> Commercial
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="h-2 w-5 bg-[repeating-linear-gradient(135deg,var(--color-label)_0px,var(--color-label)_2px,transparent_2px,transparent_5px)]"
          />
          Research
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-2 w-5 border-2 border-label" /> Education
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-2 bg-signal" /> In progress
        </span>
      </div>

      <div
        role="img"
        aria-label={`Timeline of commercial roles, research and education, ${domainLabel}: ${axisDescription}.`}
        className="relative mt-3 h-[30rem] w-full border border-grid bg-panel md:h-[15rem]"
      >
        {/* Year ticks, plus the axis-break notch if the axis has one */}
        <div className={LANE_CLASS} style={posVar(tickSlot.pos, tickSlot.span)} aria-hidden>
          <div className="relative h-full w-full">
            {ticks.map((tick) => (
              <div key={tick.year}>
                <div className={TICK_LINE_CLASS} style={posVar(tick.pct)} />
                <span className={TICK_LABEL_CLASS} style={posVar(tick.pct)}>
                  &apos;{String(tick.year).slice(-2)}
                </span>
              </div>
            ))}
            {earlyBreak && (
              <div className={AXIS_BREAK_CLASS} style={posVar(earlyBreak.screenPct)}>
                <span className={AXIS_BREAK_TICK_CLASS} />
                <span className={AXIS_BREAK_TICK_CLASS} />
              </div>
            )}
          </div>
        </div>

        {tracks.map((track) => (
          <div key={`${track.name}-group`}>
            <div className={LANE_CLASS} style={posVar(track.headerSlot.pos, track.headerSlot.span)} aria-hidden>
              <div className="relative h-full w-full border-t border-grid md:border-t-0 md:border-l">
                <span className={TRACK_LABEL_CLASS}>{track.name}</span>
              </div>
            </div>

            {track.laneSlots.map((slot, lane) => (
              <div key={`${track.name}-lane-${lane}`} className={LANE_CLASS} style={posVar(slot.pos, slot.span)} aria-hidden>
                <div className="relative h-full w-full border-t border-grid md:border-t-0 md:border-l">
                  {track.positioned
                    .filter((e) => e.lane === lane)
                    .map((entry) => (
                      <div key={entry.key} title={`${entry.heading}, ${entry.sub}, ${entry.range.current ? 'current' : ''}`}>
                        <div className={`${BAR_CLASS} ${track.bar(entry.range.current)}`} style={posVar(entry.startPct, entry.spanPct)} />
                        <span
                          className={labelAnchor(entry).className}
                          style={posVar(labelAnchor(entry).pos)}
                        >
                          {entry.sub}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        {londonEntry && (
          <>
            <div className={MARKER_LINE_CLASS} style={posVar(londonEntry.startPct)} aria-hidden />
            <span className={MARKER_LABEL_CLASS} style={posVar(londonEntry.startPct)} aria-hidden>
              Nepal &rarr; London
            </span>
          </>
        )}

        {/* Domain bounds echo the diagrams' own input/output markers: the
            axis starts on unresolved --label and ends on resolved --signal,
            the same two positions the record actually starts and reaches
            "now" at, not new data. */}
        <span aria-hidden className="absolute left-0 top-0 size-2 -translate-x-1 -translate-y-1 bg-label" />
        <span aria-hidden className="absolute top-0 right-0 size-2 translate-x-1 -translate-y-1 bg-signal" />
      </div>

      {/* Below md each track column is only about 60px wide, far too narrow to
          carry a 30-character name without spilling past the viewport. On small
          screens the bars keep the shape of the story and the names move to a
          real list underneath. That also gives this chart genuine text content
          rather than only its role="img" summary. */}
      <ul className="mt-6 space-y-4 md:hidden">
        {tracks.map((track) => (
          <li key={`${track.name}-list`}>
            <p className="font-mono text-12 uppercase tracking-[0.08em] text-label">{track.name}</p>
            <ul className="mt-1 space-y-1">
              {track.positioned.map((entry) => (
                <li key={`${entry.key}-list`} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-14 text-bone">{entry.sub}</span>
                  <span className="font-mono text-12 text-label">{yearSpan(entry.range)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* Two sentences for the reader: why the early years are squeezed, and
          that overlapping bars mean real overlapping time. It still has to
          match what the axis does, so the compressed case names the move and
          the linear case says it is to scale. */}
      <p className="mt-4 max-w-[64ch] text-14 leading-relaxed text-label">
        {focusStop ? (
          <>
            The years before the {focusStop.date.getFullYear()} move to London are compressed to give
            recent work room. Overlapping bars are real: the MSc, the research role and
            Foundermatcha ran alongside each other.
          </>
        ) : (
          <>
            Drawn to scale. Overlapping bars are real: the MSc, the research role and Foundermatcha
            ran alongside each other.
          </>
        )}
      </p>
    </div>
  )
}
