'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { CaseStudy } from '@/content'
import { useCapability } from '@/lib/useCapability'
import { Diagram } from '@/components/graphics/Diagram'

type BeatKey = 'situation' | 'constraint' | 'decision' | 'outcome'

const BEATS: { key: BeatKey; label: string }[] = [
  { key: 'situation', label: 'Situation' },
  { key: 'constraint', label: 'Constraint' },
  { key: 'decision', label: 'Decision' },
  { key: 'outcome', label: 'Outcome' },
]

/** Minimum scroll distance a study pins for. Four short, deliberate steps ,
 *  not a long drag, per owner review (Task K). */
const MIN_PIN_DISTANCE_PX = 1200

/** Cuts prose to its first sentence. Never invents text: only ever returns a
 * prefix of what `src/content/` already states. Used solely for the pinned
 * teaser frame , the full paragraph still reads on `/work/<slug>` and in the
 * unpinned `lite`/`static` composition below. */
function firstSentence(text: string): string {
  const cut = text.indexOf('. ')
  return cut === -1 ? text : text.slice(0, cut + 1)
}

/** Full beat content, every paragraph. Used by the unpinned `lite`/`static`
 * composition, which stacks all four beats at full length with no pinning. */
function beatBodyFull(key: BeatKey, study: CaseStudy) {
  switch (key) {
    case 'situation':
      return study.situation.map((paragraph) => (
        <p key={paragraph} className="text-16 leading-relaxed text-muted">
          {paragraph}
        </p>
      ))
    case 'constraint':
      return <p className="text-16 leading-relaxed text-ink">{study.constraint}</p>
    case 'decision':
      return study.decision.map((paragraph) => (
        <p key={paragraph} className="text-16 leading-relaxed text-muted">
          {paragraph}
        </p>
      ))
    case 'outcome':
      return (
        <ul className="flex flex-col gap-2">
          {study.outcomes.map((metric) => (
            <li key={metric.value} className="text-16 leading-relaxed text-muted">
              <span className="font-mono text-ink">{metric.value}</span> {metric.label}
            </li>
          ))}
        </ul>
      )
  }
}

/** Trimmed teaser for the pinned, fixed-height frame: the lead sentence of
 * the first paragraph for prose beats, the full (already short) constraint,
 * and the full outcome list (three short lines). The home page is a teaser;
 * `/work/<slug>` carries the rest. */
function beatBodyLead(key: BeatKey, study: CaseStudy) {
  switch (key) {
    case 'situation':
      return <p className="text-16 leading-relaxed text-muted">{firstSentence(study.situation[0])}</p>
    case 'constraint':
      return <p className="text-16 leading-relaxed text-ink">{study.constraint}</p>
    case 'decision':
      return <p className="text-16 leading-relaxed text-muted">{firstSentence(study.decision[0])}</p>
    case 'outcome':
      return (
        <ul className="flex flex-col gap-2">
          {study.outcomes.map((metric) => (
            <li key={metric.value} className="text-16 leading-relaxed text-muted">
              <span className="font-mono text-ink">{metric.value}</span> {metric.label}
            </li>
          ))}
        </ul>
      )
  }
}

/**
 * SIGNATURE 3: the pinned case-study narrative. On `full` tier, the whole
 * row pins (`top top`, `scrub: 1`) and scrolling scrubs a single `progress`
 * value from 0 to 1. That value drives two things at once: which of the
 * four narrative beats (situation, constraint, decision, outcome) reads as
 * current, and the `progress` prop already wired into the case study's own
 * `Diagram` (`components/graphics/`), which builds itself stage by stage
 * from that same number. This component only drives the contract, it never
 * redraws the diagram.
 *
 * Task K rewrite: only the current beat renders, inside a fixed-height
 * frame sized for the longest teaser across every study, crossfading as
 * `progress` advances. Nothing about the pinned viewport grows or shrinks
 * as the beat changes, so the active beat and the diagram it accompanies
 * stay on screen together for the whole pin, and the crossfade itself is
 * visible instead of scrolling past before the next beat arrives.
 *
 * `lite` and `static` never register a ScrollTrigger and never pin at all,
 * scroll-jacking on touch is exactly where sites like this break. Both
 * tiers render the same four beats simply stacked, at full opacity and full
 * length, with the diagram already fully built (`progress={1}`) , `static`
 * is also where `prefers-reduced-motion` lands (see `useCapability`), so
 * reduced motion gets this same complete, static composition, not merely
 * paused animation.
 */
export function PinnedStory({ study }: { study: CaseStudy }) {
  const { tier } = useCapability()
  const triggerRef = useRef<HTMLLIElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (tier !== 'full') return
    const node = triggerRef.current
    if (!node) return

    let cancelled = false
    let ctx: { revert: () => void } | undefined

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: node,
          start: 'top top',
          end: () => `+=${Math.max(window.innerHeight * 1.2, MIN_PIN_DISTANCE_PX)}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => setProgress(self.progress),
        })
      }, node)
    })()

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [tier])

  const pinned = tier === 'full'
  const diagramProgress = pinned ? progress : 1
  const activeBeat = pinned ? Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length)) : BEATS.length - 1

  return (
    <li
      ref={triggerRef}
      data-pinned={pinned ? 'true' : 'false'}
      data-progress={pinned ? progress.toFixed(3) : 1}
      className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-rule py-14 lg:grid-cols-12 lg:gap-x-10 lg:py-20"
    >
      <div className="lg:col-span-3">
        <h3>
          <Link
            href={`/work/${study.slug}`}
            className="font-subhead text-28 tracking-[-0.01em] text-ink transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
          >
            {study.client}
          </Link>
        </h3>
        <p className="mt-3 font-mono text-12 leading-relaxed text-muted">
          {study.employer}
          <br />
          {study.role}
          <br />
          {study.dates}
        </p>
      </div>

      <div className="lg:col-span-4">
        {pinned ? (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {BEATS.map((beat, index) => (
                <span
                  key={beat.key}
                  className={`border-b-2 pb-1 font-mono text-12 uppercase tracking-[0.14em] transition-colors duration-300 ${
                    index === activeBeat ? 'border-signal text-ink' : 'border-transparent text-muted'
                  }`}
                >
                  {beat.label}
                </span>
              ))}
            </div>
            {/* Fixed-height frame: reserved for the longest beat teaser across
                every case study, so crossfading beats never reflows the pinned
                viewport (Task K). */}
            <div className="relative mt-4 h-[230px] sm:h-[190px]">
              {BEATS.map((beat, index) => (
                <div
                  key={beat.key}
                  data-beat={beat.key}
                  data-built={index <= activeBeat ? 'true' : 'false'}
                  aria-hidden={index !== activeBeat}
                  style={{ opacity: index === activeBeat ? 1 : 0 }}
                  className="absolute inset-0 flex flex-col gap-3 transition-opacity duration-300"
                >
                  {beatBodyLead(beat.key, study)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-6">
            {BEATS.map((beat, index) => (
              <div key={beat.key} data-beat={beat.key} data-built={index <= activeBeat ? 'true' : 'false'}>
                <h4 className="font-mono text-12 uppercase tracking-[0.14em] text-muted">{beat.label}</h4>
                <div className="mt-2 flex flex-col gap-3">{beatBodyFull(beat.key, study)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-rule bg-surface p-6 lg:col-span-5">
        <Diagram id={study.diagram} progress={diagramProgress} className="h-auto w-full" />
      </div>
    </li>
  )
}
