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

/** Minimum scroll distance a study pins for, so four beats never feel rushed. */
const MIN_PIN_DISTANCE_PX = 2400

function beatBody(key: BeatKey, study: CaseStudy) {
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
 * `lite` and `static` never register a ScrollTrigger and never pin at all,
 * scroll-jacking on touch is exactly where sites like this break. Both
 * tiers render the same four beats simply stacked, at full opacity, with
 * the diagram already fully built (`progress={1}`) , `static` is also
 * where `prefers-reduced-motion` lands (see `useCapability`), so reduced
 * motion gets this same complete, static composition, not merely paused
 * animation.
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
          end: () => `+=${Math.max(window.innerHeight * 2.5, MIN_PIN_DISTANCE_PX)}`,
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
      className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-grid py-14 lg:grid-cols-12 lg:gap-x-10 lg:py-20"
    >
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
          <span aria-hidden className="mr-1.5 inline-block size-1.5 bg-depth align-middle" />
          {study.employer}
          <br />
          {study.role}
          <br />
          {study.dates}
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-4">
        {BEATS.map((beat, index) => (
          <div
            key={beat.key}
            data-beat={beat.key}
            data-built={index <= activeBeat ? 'true' : 'false'}
            style={pinned ? { opacity: index === activeBeat ? 1 : 0.32 } : undefined}
            className="transition-opacity duration-300"
          >
            <h4 className="flex items-center gap-2 font-mono text-12 uppercase tracking-[0.14em] text-label">
              <span aria-hidden className={`inline-block size-1.5 ${index === activeBeat ? 'bg-signal' : 'bg-grid'}`} />
              {beat.label}
            </h4>
            <div className="mt-2 flex flex-col gap-3">{beatBody(beat.key, study)}</div>
          </div>
        ))}
      </div>

      <div className="border border-grid bg-panel p-6 lg:col-span-5">
        <Diagram id={study.diagram} progress={diagramProgress} className="h-auto w-full" />
        {pinned && (
          <p aria-hidden className="mt-3 text-right font-mono text-12 text-label tabular-nums">
            {Math.round(progress * 100)}%
          </p>
        )}
      </div>
    </li>
  )
}
