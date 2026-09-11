'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { List, X } from '@phosphor-icons/react/dist/ssr'

/**
 * The eight home-page sections in document order, each already carrying a
 * matching `id` (`src/components/sections/*`), and the nav destination each
 * one belongs to. The nav is a table of contents, so a section with no item
 * of its own highlights the nearest item before it: Position is still Home,
 * Stack sits under Research, About under Trajectory. Before this, only three
 * of the eight sections lit anything, so half the page scrolled past with the
 * nav blank. `nav` is a real destination href, so `aria-current` compares
 * against it rather than guessing from a label.
 */
const SECTIONS: { id: string; label: string; nav: string }[] = [
  { id: 'hero', label: 'Hero', nav: '/' },
  { id: 'position', label: 'Position', nav: '/' },
  { id: 'work', label: 'Selected Work', nav: '/#work' },
  { id: 'research', label: 'Research', nav: '/research' },
  { id: 'stack', label: 'Stack', nav: '/research' },
  { id: 'trajectory', label: 'Trajectory', nav: '/#trajectory' },
  { id: 'about', label: 'About', nav: '/#trajectory' },
  { id: 'contact', label: 'Contact', nav: '/#contact' },
]

// `newTab` marks the one destination that is a document rather than a place
// on the site: /resume is a Route Handler streaming the PDF inline, so it
// opens in its own tab and the reader keeps their place here. It renders as
// a plain <a>, since there is no client route for next/link to prefetch, and
// RouteTransition already ignores any anchor with a target, so the wipe never
// fires for it.
const DESTINATIONS: { href: string; label: string; newTab?: boolean }[] = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Work' },
  { href: '/research', label: 'Research' },
  { href: '/#trajectory', label: 'Trajectory' },
  { href: '/#contact', label: 'Contact' },
  { href: '/resume', label: 'Résumé', newTab: true },
]

const NEW_TAB_NOTE = <span className="sr-only"> (opens in a new tab)</span>

/** A short, static label for routes that carry no home-section scrollspy. */
const ROUTE_LABELS: Record<string, string> = {
  '/research': 'Research',
}

function routeLabel(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  if (pathname.startsWith('/work/')) return 'Case Study'
  return 'Résumé'
}

/**
 * Site-wide primary navigation, rebuilt as an instrument readout rather
 * than a row of evenly spaced links (task-L-brief.md §3): it states where
 * the reader currently is (section name and its index out of seven), how
 * far through the document that is (a live percentage, and a hairline fill
 * bar under the header), and only then offers the five destinations, now
 * marked with `aria-current` on whichever one matches the visible section.
 *
 * One line, 64px tall at desktop (well under the 80px cap) plus a 1px
 * status bar. Every destination stays a real, keyboard-reachable `<Link>`;
 * the live readout is a separate, non-interactive `aria-live` region so a
 * screen reader hears position updates without them competing with the
 * link list's own announcements.
 */
export function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrollFraction, setScrollFraction] = useState(0)

  // Position through the page, and on home the current section, from one
  // scroll handler. The percentage is meaningful on every route.
  //
  // The current section is the last one whose top has crossed a line 30% of
  // the way down the viewport, or the last section once the page can scroll
  // no further. That has exactly one answer for any scroll position and is
  // recomputed on every scroll, so it cannot go stale. The IntersectionObserver
  // it replaces reacted only to sections entering a thin band and let the last
  // entry in a batch win: after a nav jump two sections could straddle the band
  // at once, and the nav lit Home while the reader sat at Work.
  useEffect(() => {
    function update() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      setScrollFraction(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0)
      if (!isHome) return

      const line = window.innerHeight * 0.3
      let index = 0
      SECTIONS.forEach((section, i) => {
        const el = document.getElementById(section.id)
        if (el && el.getBoundingClientRect().top <= line) index = i
      })
      if (scrollable > 0 && window.scrollY >= scrollable - 2) index = SECTIONS.length - 1
      setActiveIndex(index)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname, isHome])

  const currentSection = isHome ? SECTIONS[activeIndex] : undefined
  const currentLabel = currentSection?.label ?? routeLabel(pathname)
  const positionLabel = isHome
    ? `${String(activeIndex + 1).padStart(2, '0')}/${String(SECTIONS.length).padStart(2, '0')}`
    : null
  const percent = Math.round(scrollFraction * 100)

  // One rule per kind of page: on home, whichever item owns the section in
  // view; on /research, Research; on a case study, Work, since that is where
  // the case studies live on the home page.
  function isActive(href: string): boolean {
    if (isHome) return currentSection?.nav === href
    if (pathname === '/research') return href === '/research'
    if (pathname.startsWith('/work/')) return href === '/#work'
    return false
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-grid bg-ground/90 backdrop-blur-sm">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-6">
        <Link
          href="/"
          className="shrink-0 font-mono text-14 text-bone transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
        >
          Sushan Sunuwar
        </Link>

        {/* The instrument readout: where the reader is, not a destination.
            Hidden on narrow viewports, where the disclosure button below
            carries a shorter form of the same reading. */}
        <p
          aria-live="polite"
          className="hidden min-w-0 flex-1 items-baseline gap-2 font-mono text-12 text-label md:flex"
        >
          {positionLabel && <span className="shrink-0 tabular-nums text-signal">{positionLabel}</span>}
          <span className="truncate uppercase tracking-[0.08em]">{currentLabel}</span>
          <span className="shrink-0 tabular-nums text-label">{percent}%</span>
        </p>

        <ul className="hidden items-center gap-6 md:flex">
          {DESTINATIONS.map((link) => {
            const className =
              'text-14 text-label transition-colors hover:text-bone aria-[current=true]:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4'
            return (
              <li key={link.href}>
                {link.newTab ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {link.label}
                    {NEW_TAB_NOTE}
                  </a>
                ) : (
                  <Link href={link.href} aria-current={isActive(link.href) ? 'true' : undefined} className={className}>
                    {link.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* ml-auto, because on narrow viewports the flex-1 readout above is
            hidden and nothing else pushes this group to the right edge. */}
        <div className="ml-auto flex items-center gap-3 md:hidden">
          {positionLabel && (
            <span className="font-mono text-12 tabular-nums text-label" aria-hidden>
              {positionLabel}
            </span>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-[var(--radius)] p-2 text-bone focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
          >
            {open ? <X size={20} aria-hidden /> : <List size={20} aria-hidden />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </nav>

      {/* Position bar: a constant, literal reading of how far through the
          document the reader is, on every route. */}
      <div aria-hidden className="h-px w-full bg-grid">
        <div className="h-full bg-signal" style={{ width: `${percent}%` }} />
      </div>

      {open && (
        <ul id="mobile-nav" className="border-t border-grid px-6 py-2 md:hidden">
          {DESTINATIONS.map((link) => {
            const className =
              'block py-3 text-16 text-bone aria-[current=true]:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4'
            return (
              <li key={link.href} className="border-b border-grid last:border-b-0">
                {link.newTab ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={className}
                  >
                    {link.label}
                    {NEW_TAB_NOTE}
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(link.href) ? 'true' : undefined}
                    className={className}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </header>
  )
}
