'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type RevealMode = 'immediate' | 'onView'

/**
 * The site's one text-motion idea (task-L-brief.md §5): type resolves out of
 * a soft blur exactly like the SVG lattice and the hero shader resolve
 * noise into signal everywhere else on the page. Applied only to hero
 * lines and section headings, via the `reveal-text` / `reveal-pending`
 * classes in `globals.css`, never as blanket motion.
 *
 * The contract that keeps this from ever gating content:
 *   - The element starts (server-rendered, and on first client paint before
 *     this hook's effects run) with no `reveal-pending` class at all, so it
 *     is fully opaque and sharp , present and readable , whether or not
 *     JavaScript ever runs.
 *   - `reveal-pending` is only ever added after a synchronous
 *     `prefers-reduced-motion` check fails to match, and only inside a
 *     `useLayoutEffect` so it lands before the browser's first paint of the
 *     hydrated tree rather than flashing sharp-then-blurred.
 *   - Reduced motion never adds the class, so that composition is complete
 *     and static from the very first frame, not merely "animation off".
 *
 * `mode: 'immediate'` clears the pending state a couple of frames after
 * mount, for text already in the viewport on load (the hero). `mode:
 * 'onView'` (default) waits for an `IntersectionObserver` to confirm the
 * heading has actually scrolled into view.
 */
export function useRevealText<T extends HTMLElement>(mode: RevealMode = 'onView') {
  const ref = useRef<T>(null)
  const [pending, setPending] = useState(false)

  useLayoutEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduced) return
    setPending(true)
  }, [])

  useEffect(() => {
    if (!pending) return

    if (mode === 'immediate') {
      // Two rAFs: the first lets the just-applied pending (blurred) frame
      // actually paint, the second is where the transition to resolved
      // starts, so the browser has something to animate from.
      let inner = 0
      const outer = window.requestAnimationFrame(() => {
        inner = window.requestAnimationFrame(() => setPending(false))
      })
      return () => {
        window.cancelAnimationFrame(outer)
        window.cancelAnimationFrame(inner)
      }
    }

    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setPending(false)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPending(false)
          observer.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [pending, mode])

  return { ref, className: pending ? 'reveal-text reveal-pending' : 'reveal-text' }
}
