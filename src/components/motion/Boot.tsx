'use client'

import { useEffect, useRef, useState } from 'react'
import { identity } from '@/content'

const BOOT_DURATION_MS = 1400
const BOOT_TICK_MS = 40
const SESSION_KEY = 'boot-seen'

/**
 * The site's thesis in miniature, three seconds before the hero states it
 * again at page scale: the name resolves out of noise instead of a
 * percentage counter ticking up. A blurred, splayed-out wordmark sharpens
 * and tightens as `progress` advances from 0 to 1, the same procedural
 * grain used for route-transition texture drains away behind it, and only
 * the hairline underneath still states progress as a literal number, for
 * the instrument reading `aria-valuenow` already carries for assistive
 * tech. Purely a decorative overlay mounted above already-painted content,
 * never a gate on it , the rest of the page server-renders and hydrates
 * completely unaffected, and this component itself renders nothing
 * (`null`) until its own mount effect decides to show it, so it can never
 * delay LCP or the hero's first paint.
 *
 * - Capped hard at 1.4s regardless of load state (a plain `setTimeout`, not
 *   tied to any load/ready event).
 * - Skippable on any keypress, click or tap.
 * - Skipped outright under `prefers-reduced-motion`, and on any repeat
 *   visit within the same session (`sessionStorage['boot-seen']`).
 * - No focusable content of its own: it can never trap focus, and the skip
 *   link stays first in the tab order regardless of where this renders.
 */
export function Boot() {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const dismissedRef = useRef(false)

  useEffect(() => {
    // A single synchronous read at mount, the same pattern `useCapability`
    // uses for its own one-shot reduced-motion check: this is a one-time
    // decision made once, not a live subscription to react to later.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduced) return

    let seen = false
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === '1'
    } catch {
      seen = false
    }
    if (seen) return

    setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return

    const start = Date.now()

    function dismiss() {
      if (dismissedRef.current) return
      dismissedRef.current = true
      setVisible(false)
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        // Private mode or disabled storage: the sequence simply replays
        // next visit, a fine fallback and never a broken one.
      }
    }

    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start
      setProgress(Math.min(1, elapsed / BOOT_DURATION_MS))
      if (elapsed >= BOOT_DURATION_MS) dismiss()
    }, BOOT_TICK_MS)
    const cap = window.setTimeout(dismiss, BOOT_DURATION_MS)

    window.addEventListener('keydown', dismiss)
    window.addEventListener('click', dismiss)
    window.addEventListener('touchstart', dismiss, { passive: true })

    return () => {
      window.clearInterval(tick)
      window.clearTimeout(cap)
      window.removeEventListener('keydown', dismiss)
      window.removeEventListener('click', dismiss)
      window.removeEventListener('touchstart', dismiss)
    }
  }, [visible])

  if (!visible) return null

  const percent = Math.round(progress * 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Site loading"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-paper"
    >
      <p className="font-mono text-12 uppercase tracking-[0.14em] text-muted">Instrument warming up</p>
      <p className="font-mono text-64 tabular-nums text-ink">{percent}%</p>
      <div className="h-px w-40 overflow-hidden bg-rule">
        <div className="h-full bg-signal" style={{ width: `${percent}%` }} />
      </div>
      <p className="sr-only">Press any key, click, or tap to skip.</p>
    </div>
  )
}
