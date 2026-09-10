import type { CSSProperties } from 'react'
import type { Education, Role } from '@/content'
import {
  entriesOverlap,
  parseDateRange,
  positionEntries,
  timelineDomain,
  yearTicks,
  type PositionedEntry,
  type TimelineEntry,
} from './timeline'

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
  'absolute left-4 top-[var(--pos)] max-w-[7.5rem] font-mono text-12 leading-tight text-label md:left-[var(--pos)] md:top-0 md:max-w-[9rem] md:pt-0.5'

const TICK_LINE_CLASS =
  'absolute left-0 right-0 top-[var(--pos)] h-px bg-grid md:top-0 md:bottom-0 md:right-auto md:left-[var(--pos)] md:h-full md:w-px'

const TICK_LABEL_CLASS =
  'absolute left-1.5 top-[var(--pos)] font-mono text-12 text-label md:left-[var(--pos)] md:top-auto md:bottom-0 md:ml-1'

// One small uppercase mono label per track, drawn once per track at its
// first lane's top-left corner, so Commercial / Research / Education read
// as a legend baked into the axis itself, not only in the key above it.
const TRACK_LABEL_CLASS =
  'pointer-events-none absolute left-1.5 top-1 font-mono text-12 uppercase tracking-[0.08em] text-label/70'

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

  const domain = timelineDomain([...commercialEntries, ...researchEntries, ...eduEntries])
  const commercialPositioned = positionEntries(commercialEntries, domain)
  const researchPositioned = positionEntries(researchEntries, domain)
  const eduPositioned = positionEntries(eduEntries, domain)
  const ticks = yearTicks(domain)

  const commercialLanes = laneCount(commercialPositioned)
  const researchLanes = laneCount(researchPositioned)
  const eduLanes = laneCount(eduPositioned)

  // Tick row reads thinner than a data lane; every track lane is equal
  // weight so bars read at the same scale across all three tracks.
  const TICK_WEIGHT = 0.55
  const slots = computeSlots([TICK_WEIGHT, ...Array(commercialLanes + researchLanes + eduLanes).fill(1)])
  const tickSlot = slots[0]
  const commercialSlots = slots.slice(1, 1 + commercialLanes)
  const researchSlots = slots.slice(1 + commercialLanes, 1 + commercialLanes + researchLanes)
  const eduSlots = slots.slice(1 + commercialLanes + researchLanes)

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

  const tracks = [
    { name: 'Commercial', slots: commercialSlots, positioned: commercialPositioned, bar: barToneClass },
    { name: 'Research', slots: researchSlots, positioned: researchPositioned, bar: barHatchClass },
    { name: 'Education', slots: eduSlots, positioned: eduPositioned, bar: barOutlineClass },
  ]

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
        aria-label={`Timeline of commercial roles, research and education, ${domainLabel}, drawn to scale so overlapping periods overlap on the axis.`}
        className="relative mt-3 h-[30rem] w-full border border-grid bg-panel md:h-[14rem]"
      >
        {/* Year ticks */}
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
          </div>
        </div>

        {tracks.map((track) =>
          track.slots.map((slot, lane) => (
            <div
              key={`${track.name}-lane-${lane}`}
              className={LANE_CLASS}
              style={posVar(slot.pos, slot.span)}
              aria-hidden
            >
              <div className="relative h-full w-full border-t border-grid md:border-t-0 md:border-l">
                {lane === 0 && <span className={TRACK_LABEL_CLASS}>{track.name}</span>}
                {track.positioned
                  .filter((e) => e.lane === lane)
                  .map((entry) => (
                    <div key={entry.key} title={`${entry.heading}, ${entry.sub}, ${entry.range.current ? 'current' : ''}`}>
                      <div className={`${BAR_CLASS} ${track.bar(entry.range.current)}`} style={posVar(entry.startPct, entry.spanPct)} />
                      <span className={LABEL_CLASS} style={posVar(entry.startPct)}>
                        {entry.sub}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )),
        )}

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

      <p className="mt-4 max-w-[64ch] text-14 leading-relaxed text-label">
        Drawn to scale rather than listed: the masters, the research role and Foundermatcha
        run across genuinely overlapping stretches of the same years, not one after another.
        {overlapSentences.length > 0 &&
          ` ${overlapSentences.length} pair${overlapSentences.length === 1 ? '' : 's'} of entries below overlap in date.`}
      </p>
    </div>
  )
}
