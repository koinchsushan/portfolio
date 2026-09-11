import type Lenis from 'lenis'

/**
 * The one Lenis instance, if it is running. `SmoothScroll` registers it once
 * the dynamic import resolves and clears it on teardown, so this is `null`
 * under reduced motion, on the server, and for the moment before Lenis loads.
 */
let instance: Lenis | null = null

export function registerLenis(lenis: Lenis | null) {
  instance = lenis
}

function px(value: string): number {
  const n = Number.parseFloat(value)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Where a target's top comes to rest below the viewport's top edge: the
 * root's `scroll-padding-top` plus the target's own `scroll-margin-top`.
 * That is the same sum the browser's `scrollIntoView` and Lenis's `scrollTo`
 * both use, so the offset lives only in CSS and this never duplicates it.
 */
function restingTop(el: HTMLElement): number {
  return px(getComputedStyle(document.documentElement).scrollPaddingTop) + px(getComputedStyle(el).scrollMarginTop)
}

/**
 * The single way the site scrolls to a place on the page: `target`'s top
 * lands just under the fixed header (the offset set once in globals.css), or
 * the very top of the page when `target` is null.
 *
 * Lenis and a native smooth scroll must never run at once, they write the
 * same scroll position from two animation loops and the loser stalls the
 * jump part way. So this goes through Lenis whenever Lenis is attached, and
 * through the browser only when it is not (reduced motion, or the moment
 * before Lenis has loaded). The site sets no CSS smooth scrolling, so that
 * native path is always an instant jump.
 */
export function scrollToTarget(target: HTMLElement | null) {
  const lenis = instance
  if (lenis) {
    lenis.scrollTo(target ?? 0, {
      // Defence in depth. The pinned case studies reserve their full scroll
      // distance up front so the page no longer grows under a jump, but if
      // anything above the target still changes height mid-animation, land
      // on where the target is now rather than where it was.
      onComplete: () => {
        if (!target) return
        const drift = target.getBoundingClientRect().top - restingTop(target)
        if (Math.abs(drift) > 1) lenis.scrollTo(target, { immediate: true })
      },
    })
    return
  }
  if (target) target.scrollIntoView({ block: 'start' })
  else window.scrollTo({ top: 0 })
}
