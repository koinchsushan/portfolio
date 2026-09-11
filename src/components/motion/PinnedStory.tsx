'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import type { CaseStudy } from '@/content'
import { useCapability } from '@/lib/useCapability'
import { Diagram } from '@/components/graphics/Diagram'

// `ssr: false` is what keeps `gsap` and `gsap/ScrollTrigger` out of the
// server bundle and out of this route's initial `<script>` list: see the
// docstring on `ScrollPinDriver` itself for why a bare `import('gsap')`
// inside a `useEffect` was not enough on its own.
const ScrollPinDriver = dynamic(() => import('./ScrollPinDriver').then((mod) => mod.ScrollPinDriver), {
  ssr: false,
})

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

/**
 * The pin's scroll distance, reserved in the layout from first paint on the
 * `full` tier rather than inserted by ScrollTrigger when GSAP arrives. The
 * driver is deliberately lazy (it mounts only once a study scrolls into
 * view, to keep GSAP out of the initial bundle), and a lazily inserted pin
 * spacer made the page grow by this much, three times over, while a reader
 * was already scrolling through it. A nav jump from the top to Contact was
 * aimed at the pre-pin layout and landed about 8,400px short, inside Work.
 * Reserving the space up front keeps every section below Work at the same
 * position before and after the pins exist. The driver reads this back from
 * the computed padding, so the two can never disagree.
 */
const PIN_RESERVE = `max(120vh, ${MIN_PIN_DISTANCE_PX}px)`

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
        <p key={paragraph} className="text-16 leading-relaxed text-label">
          {paragraph}
        </p>
      ))
    case 'constraint':
      return <p className="text-16 leading-relaxed text-bone">{study.constraint}</p>
    case 'decision':
      return study.decision.map((paragraph) => (
        <p key={paragraph} className="text-16 leading-relaxed text-label">
          {paragraph}
        </p>
      ))
    case 'outcome':
      return (
        <ul className="flex flex-col gap-2">
          {study.outcomes.map((metric) => (
            <li key={metric.value} className="text-16 leading-relaxed text-label">
              <span className="font-mono text-bone">{metric.value}</span> {metric.label}
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
      return <p className="text-16 leading-relaxed text-label">{firstSentence(study.situation[0])}</p>
    case 'constraint':
      return <p className="text-16 leading-relaxed text-bone">{study.constraint}</p>
    case 'decision':
      return <p className="text-16 leading-relaxed text-label">{firstSentence(study.decision[0])}</p>
    case 'outcome':
      return (
        <ul className="flex flex-col gap-2">
          {study.outcomes.map((metric) => (
            <li key={metric.value} className="text-16 leading-relaxed text-label">
              <span className="font-mono text-bone">{metric.value}</span> {metric.label}
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
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const [progress, setProgress] = useState(0)

  // A callback ref, not `useRef`: the dynamically-loaded `ScrollPinDriver`
  // needs the real DOM node as a prop, and a plain ref's `.current` mutation
  // does not itself trigger a re-render once it changes from null to the
  // mounted element.
  const setTriggerNode = useCallback((el: HTMLDivElement | null) => setNode(el), [])

  const pinned = tier === 'full'

  // The exact gate `HeroCanvas` uses before mounting its own WebGL layer:
  // without it, every one of the three case studies would import `gsap` and
  // `gsap/ScrollTrigger` the instant the capability check resolves to
  // `full`, regardless of whether the reader has scrolled anywhere near
  // `#work` yet. `threshold: 0` with no `rootMargin` fires only once the
  // trigger element actually starts crossing into the viewport.
  useEffect(() => {
    if (!pinned || !node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true)
          observer.disconnect()
        }
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [pinned, node])

  const diagramProgress = pinned ? progress : 1
  const activeBeat = pinned ? Math.min(BEATS.length - 1, Math.floor(progress * BEATS.length)) : BEATS.length - 1

  return (
    // The <li> holds the reserved pin distance as bottom padding; the inner
    // block is what pins, so the reservation stays in flow behind it.
    <li
      data-pinned={pinned ? 'true' : 'false'}
      data-progress={pinned ? progress.toFixed(3) : 1}
      style={pinned ? { paddingBottom: PIN_RESERVE } : undefined}
    >
      <div
        ref={setTriggerNode}
        className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-grid py-14 lg:grid-cols-12 lg:gap-x-10 lg:py-20"
      >
      {pinned && node && hasIntersected && <ScrollPinDriver node={node} onProgress={setProgress} />}

      <div className="lg:col-span-3">
        <h3>
          <Link
            href={`/work/${study.slug}`}
            className="font-subhead text-28 tracking-[-0.01em] text-bone transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
          >
            {study.client}
          </Link>
        </h3>
        <p className="mt-3 font-mono text-12 leading-relaxed text-label">
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
                    index === activeBeat ? 'border-signal text-bone' : 'border-transparent text-label'
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
                <h4 className="font-mono text-12 uppercase tracking-[0.14em] text-label">{beat.label}</h4>
                <div className="mt-2 flex flex-col gap-3">{beatBodyFull(beat.key, study)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-grid bg-panel p-6 lg:col-span-5">
        <Diagram id={study.diagram} progress={diagramProgress} className="h-auto w-full" />
      </div>
      </div>
    </li>
  )
}
