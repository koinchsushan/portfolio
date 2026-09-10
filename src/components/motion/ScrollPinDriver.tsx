'use client'

import { useEffect } from 'react'

/** Minimum scroll distance a study pins for. Four short, deliberate steps ,
 *  not a long drag, per owner review (Task K). */
const MIN_PIN_DISTANCE_PX = 1200

/**
 * The only module in the project that touches GSAP or ScrollTrigger. Split
 * out of `PinnedStory.tsx` on purpose: `PinnedStory` mounts this through
 * `next/dynamic(..., { ssr: false })`, the same loadable-boundary pattern
 * `HeroCanvas.tsx` uses for `three`. A bare `import('gsap')` inside a
 * `useEffect` is still reachable from the page's static module graph and
 * Next includes every chunk reachable that way in the route's initial
 * `<script>` list, so it downloads on first paint even though it never
 * runs, exactly the 106 KB gz regression this component exists to avoid.
 * Routing the import through a `next/dynamic` loadable boundary instead
 * keeps GSAP's own chunk out of that list entirely: it is fetched only once
 * this component actually mounts, which `PinnedStory` only ever does on the
 * `full` capability tier, after the trigger element itself exists.
 */
export function ScrollPinDriver({
  node,
  onProgress,
}: {
  node: HTMLElement
  onProgress: (progress: number) => void
}) {
  useEffect(() => {
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
          onUpdate: (self) => onProgress(self.progress),
        })
      }, node)
    })()

    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [node, onProgress])

  return null
}
