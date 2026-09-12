'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/** How much of the figure has to be in view before it draws. */
const THRESHOLD = 0.35

/**
 * Final backstop. Reaching a section later than this simply means the figure
 * is already drawn when you get there, which is exactly what reduced motion
 * and a no-JS load show, so the cost of it firing is nothing.
 */
const BACKSTOP_MS = 20_000

/**
 * Wipes a drawn figure in, left to right, once it scrolls into view: the same
 * verb the axes themselves use, since time and every scale on this site run in
 * that direction. Used for the instrument marks above the Position figures and
 * for the Trajectory axis.
 *
 * The contract, the same one `useRevealText` holds for type:
 *   - The figure renders complete with no class at all. That is the
 *     server-rendered state, the no-JavaScript state, and the reduced-motion
 *     state: nothing here can ever be what decides whether content is visible.
 *   - `reveal-pending` is only added after IntersectionObserver is confirmed to
 *     exist and reduced motion is confirmed not to be set, inside a layout
 *     effect so it lands before paint rather than flashing drawn then blank.
 *   - It is cleared on intersection, on the tab being hidden (an observer does
 *     not run in a hidden tab, and nothing should be waiting on one when the
 *     reader comes back), and by a long backstop.
 *
 * It deliberately does not reuse `useRevealText`'s state machine. That hook
 * clears itself 2.5s after load whatever happens, because text must never wait
 * on an observer to become readable; measured against a real scroll, that also
 * means a reader who reaches a section after 2.5s never sees the reveal at all.
 * The right guarantee for type is the wrong one for a figure that is already
 * whole and is only being drawn in.
 *
 * `delay` staggers a row of figures so they read as separate instruments being
 * taken one after another, not one graphic sliding in.
 */
export function RevealOnView({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState(false)

  useLayoutEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduced || typeof IntersectionObserver === 'undefined') return
    setPending(true)
  }, [])

  useEffect(() => {
    if (!pending) return
    const node = ref.current
    if (!node) {
      setPending(false)
      return
    }

    const backstop = window.setTimeout(() => setPending(false), BACKSTOP_MS)
    const onVisibilityChange = () => {
      if (document.hidden) setPending(false)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPending(false)
      },
      { threshold: THRESHOLD },
    )
    observer.observe(node)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.clearTimeout(backstop)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      observer.disconnect()
    }
  }, [pending])

  // Unconditional: the transition plays on the frame `pending` is removed, so
  // a delay that only existed while pending would never be read.
  const style: CSSProperties | undefined = delay ? { transitionDelay: `${delay}ms` } : undefined

  // Two elements on purpose. A clipped element reports itself as not
  // intersecting (measured: a fresh observer on the clipped node returns
  // ratio 0.00 while the node sits in the middle of the viewport), so
  // observing the thing being wiped is a deadlock: it can never be seen, so
  // it is never drawn. The outer node is never clipped and is what the
  // observer watches.
  return (
    <div ref={ref} className={className}>
      <div style={style} className={`reveal-wipe ${pending ? 'reveal-pending' : ''}`}>
        {children}
      </div>
    </div>
  )
}
