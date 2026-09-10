import type { CSSProperties } from 'react'
import type { Education, Role } from '@/content'
import {
  entriesOverlap,
  findAxisBreak,
  parseDateRange,
  positionEntries,
  timelineDomain,
  yearTicks,
  type AxisBreak,
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
const BAR_CLASS =
  'absolute left-0 top-[var(--pos)] h-[var(--span)] w-2 md:left-[var(--pos)] md:top-1/2 md:h-2 md:w-[var(--span)] md:-translate-y-1/2'

const LABEL_CLASS =
  'absolute hidden left-4 top-[var(--pos)] max-w-[7.5rem] font-mono text-12 leading-tight text-label md:block md:left-[var(--pos)] md:top-0 md:max-w-[9rem] md:pt-0.5'

// An entry whose bar starts past NEAR_END_THRESHOLD gets this instead: same
// anchor point, but the label is pulled back over its own start with a
// transform (bottom-anchored below md, right-anchored at md+) so it grows
// inward, toward the middle of the plot, rather than outward past the
// frame. Anchoring with a transform keeps the anchor point itself, --pos,
// identical to the plain label, so it is still exactly where the bar
// starts , only the direction the text grows from flips.
const LABEL_CLASS_END =
  'absolute hidden left-4 top-[var(--pos)] max-w-[7.5rem] -translate-y-full font-mono text-12 leading-tight text-label md:block md:left-[var(--pos)] md:top-0 md:max-w-[9rem] md:translate-y-0 md:-translate-x-full md:pt-0.5 md:text-right'

// Past this point a start-anchored label's max-width would carry it past
// the plot's far edge on any width this axis actually renders at; entries
// starting later than this anchor from their end instead (see
// LABEL_CLASS_END). A position, not a per-entry constant: every entry is
// tested against the same threshold, whichever ones end up past it.
const NEAR_END_THRESHOLD = 80

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

const MARKER_LABEL_CLASS =
  'absolute left-1.5 top-[var(--pos)] -mt-4 font-mono text-12 text-label md:left-[var(--pos)] md:top-0 md:mt-0 md:ml-1.5'

// The axis break: two short tilted strokes centred on the tick lane at the
// break point, the standard double-slash cut mark for a compressed axis, so
// the compression is declared rather than hidden. Deliberately a small mark
// on the axis itself, not a rule crossing every track , that reads as a
// second Nepal-to-London marker, which is a dashed line spanning the whole
// plot on purpose.
const AXIS_BREAK_CLASS =
  'absolute left-0 right-0 top-[var(--pos)] flex items-center justify-center gap-1 md:top-0 md:bottom-0 md:left-[var(--pos)] md:right-auto md:flex-col md:justify-center'

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

function findOverlapSentences(all: (PositionedEntry & { display: string })[]): string[] {
  const sentences: string[] = []
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (entriesOverlap(all[i], all[j])) {
        sentences.push(`${all[i].display} overlaps ${all[j].display}`)
      }
    }
  }
  return sentences
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

  // The years 2018 to roughly 2022 carry a single entry (the BSc) while
  // everything else, including the three genuinely overlapping spans this
  // axis exists to show, land after it; a plain linear scale would spend
  // half the width on the former. `findAxisBreak` derives where to pivot
  // from the data itself, and every position below is pushed through the
  // same break so ordering, and overlaps, survive the compression exactly.
  const axisBreak = findAxisBreak(allEntries, domain)

  const commercialPositioned = positionEntries(commercialEntries, domain, axisBreak)
  const researchPositioned = positionEntries(researchEntries, domain, axisBreak)
  const eduPositioned = positionEntries(eduEntries, domain, axisBreak)
  const ticks = yearTicks(domain, axisBreak)

  const commercialLanes = laneCount(commercialPositioned)
  const researchLanes = laneCount(researchPositioned)
  const eduLanes = laneCount(eduPositioned)

  // Tick row reads thinner than a data lane; every track lane is equal
  // weight so bars read at the same scale across all three tracks. Each
  // track also reserves a header slot, sized for one line of mono-12 text,
  // that carries only its name , never an entry, at any zoom, in either
  // orientation, because entries are only ever placed into a lane slot.
  const TICK_WEIGHT = 0.55
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

  const overlapSentences = findOverlapSentences([
    ...commercialPositioned.map((e) => ({ ...e, display: `${e.sub} (${roles.find((r) => r.org === e.key)?.dates})` })),
    ...researchPositioned.map((e) => ({ ...e, display: `${e.sub} (${roles.find((r) => r.org === e.key)?.dates})` })),
    ...eduPositioned.map((e) => ({ ...e, display: `${e.sub} (${education.find((ed) => ed.institution === e.key)?.dates})` })),
  ])

  const domainLabel = `${domain.start.getFullYear()} to present`

  const axisDescription = axisBreak
    ? `the years before ${axisBreak.date.getFullYear()} are compressed, marked by the break in the axis, so the overlapping periods after it stay readable; those overlaps are real`
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
        className="relative mt-3 h-[30rem] w-full border border-grid bg-panel md:h-[14rem]"
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
            {axisBreak && (
              <div className={AXIS_BREAK_CLASS} style={posVar(axisBreak.screenPct)}>
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
                          className={entry.startPct >= NEAR_END_THRESHOLD ? LABEL_CLASS_END : LABEL_CLASS}
                          style={posVar(entry.startPct)}
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

      {/* The caption has to match what the axis actually does. Claiming
          "drawn to scale" stopped being true the moment the early years were
          compressed, so the broken case says so and names the break. */}
      <p className="mt-4 max-w-[64ch] text-14 leading-relaxed text-label">
        {axisBreak ? (
          <>
            The years before {axisBreak.date.getFullYear()} carry one entry, so the axis is
            broken there and they are compressed into a fifth of its width. Bars are to scale
            within each region, and the overlaps are real: the masters, the research role and
            Foundermatcha run across the same stretches of the same years rather than one
            after another.
          </>
        ) : (
          <>
            Drawn to scale rather than listed: the masters, the research role and Foundermatcha
            run across genuinely overlapping stretches of the same years, not one after another.
          </>
        )}
        {overlapSentences.length > 0 &&
          ` ${overlapSentences.length} pair${overlapSentences.length === 1 ? '' : 's'} of entries below overlap in date.`}
      </p>
    </div>
  )
}
