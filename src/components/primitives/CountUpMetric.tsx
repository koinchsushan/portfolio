'use client'

import { useLayoutEffect, useRef } from 'react'
import { metricClass, type MetricSize, type MetricTone } from './Metric'

/** Long enough to read as a sweep, short enough that nobody waits for it. */
const DURATION_MS = 1100

/**
 * Splits a figure from `src/content/` into the part that can count and the
 * parts that cannot: "450,000+" is 450000 with a "+" after it, "~30%" is 30
 * with a "~" before and a "%" after. Returns null for anything it cannot
 * read, and the caller then simply never animates, so a figure this does not
 * understand still renders exactly as written.
 */
export function parseFigure(value: string) {
  const match = /^(\D*)(\d[\d,]*)(.*)$/.exec(value)
  if (!match) return null
  const [, prefix, digits, suffix] = match
  const target = Number(digits.replace(/,/g, ''))
  if (!Number.isFinite(target)) return null
  return { prefix, target, suffix, grouped: digits.includes(',') }
}

/** Formats a step of the count the way the source figure is written. */
export function formatStep(n: number, figure: NonNullable<ReturnType<typeof parseFigure>>): string {
  const digits = figure.grouped ? n.toLocaleString('en-US') : String(n)
  return `${figure.prefix}${digits}${figure.suffix}`
}

/**
 * Decelerating, not the site's `--ease-resolve`. That curve puts three
 * quarters of its distance into its first fifth, which on a counter means
 * the number blurs past and then crawls through its last few hundred for a
 * second, reading as stuck rather than as settling.
 */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3
}

/**
 * Final backstop, and the only thing standing between a broken observer and a
 * figure reading zero. Nothing else can leave it there: it is cleared the
 * moment a count starts, and the tab going away finishes the figure outright.
 */
const BACKSTOP_MS = 20_000

/** How much of the figure has to be showing before it starts counting. About
 *  a fifth of one line: the top of the number appearing is the trigger. */
const THRESHOLD = 0.2

/**
 * A figure that counts up to itself as it is reached.
 *
 * It is held at zero from before the first paint, not switched to zero when
 * the count begins. Arming it on arrival meant the true figure was on screen
 * for the moment between the row appearing and the sweep starting, which read
 * as a number changing its mind rather than a reading being taken. Now the
 * figures are already at zero while they are still below the fold, and the
 * sweep starts on the frame they come into view.
 *
 * The count is drawn in a `::after`, and the real figure stays in the DOM as
 * text the whole time, hidden the way `sr-only` hides anything. That is the
 * point of doing it this way rather than rewriting the text node: the value a
 * screen reader announces, and the value any test or scraper reads, is always
 * the exact string from `src/content/`, never a frame of the animation.
 * Without JavaScript, and under reduced motion, the figure simply renders as
 * itself and nothing counts.
 */
export function CountUpMetric({
  value,
  size = 'lg',
  tone = 'bone',
  delay = 0,
  className = '',
}: {
  value: string
  size?: MetricSize
  tone?: MetricTone
  /** Stagger, so a row of figures reads as separate instruments. */
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  // Layout, not plain effect: the hold at zero has to land before the browser
  // paints, or the figure shows its real value for a frame first.
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduced || typeof IntersectionObserver === 'undefined') return

    const figure = parseFigure(value)
    if (!figure || figure.target === 0) return

    let frame = 0
    let startTimer = 0
    let backstop = 0

    /** Hands the figure back to its own text. The only end state there is. */
    const finish = () => {
      window.clearTimeout(backstop)
      window.clearTimeout(startTimer)
      cancelAnimationFrame(frame)
      node.classList.remove('is-counting')
      node.style.removeProperty('--count')
    }

    const paint = (n: number) => node.style.setProperty('--count', JSON.stringify(formatStep(n, figure)))

    const run = () => {
      window.clearTimeout(backstop)
      const t0 = performance.now()
      const step = () => {
        const t = Math.min((performance.now() - t0) / DURATION_MS, 1)
        if (t >= 1) {
          // The last frame is the source string itself, never a formatted
          // reconstruction of it: what is left on screen is what was written.
          finish()
          return
        }
        paint(Math.round(figure.target * easeOut(t)))
        frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }

    paint(0)
    node.classList.add('is-counting')
    backstop = window.setTimeout(finish, BACKSTOP_MS)

    // An observer does not run in a hidden tab, and a figure should never be
    // sitting at zero waiting for one when the reader comes back.
    const onVisibilityChange = () => {
      if (document.hidden) finish()
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        startTimer = window.setTimeout(run, delay)
      },
      { threshold: THRESHOLD },
    )
    observer.observe(node)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibilityChange)
      finish()
    }
  }, [value, delay])

  return (
    <span ref={ref} className={`count-up ${metricClass(size, tone)} ${className}`}>
      <span>{value}</span>
    </span>
  )
}
