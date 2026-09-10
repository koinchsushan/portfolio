'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { List, X } from '@phosphor-icons/react/dist/ssr'

/**
 * The eight home-page sections in document order, each already carrying a
 * matching `id` (`src/components/sections/*`). `href` is set only where a
 * destination link below actually targets that section, so `aria-current`
 * can compare against a real href instead of guessing from a label string.
 */
const SECTIONS: { id: string; label: string; href?: string }[] = [
  { id: 'hero', label: 'Hero', href: '/' },
  { id: 'position', label: 'Position' },
  { id: 'work', label: 'Selected Work', href: '/#work' },
  { id: 'research', label: 'Research' },
  { id: 'stack', label: 'Stack' },
  { id: 'trajectory', label: 'Trajectory', href: '/#trajectory' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
]

const DESTINATIONS = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Work' },
  { href: '/research', label: 'Research' },
  { href: '/#trajectory', label: 'Trajectory' },
  { href: '/#contact', label: 'Contact' },
  { href: '/resume', label: 'Résumé' },
]

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
 * than six evenly spaced links (task-L-brief.md §3): it states where the
 * reader currently is (section name and its index out of eight), how far
 * through the document that is (a live percentage, and a hairline fill
 * bar under the header), and only then offers the six destinations, now
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

  // Position through the page: meaningful on every route, not just the
  // scrollspied home page, so it is computed unconditionally.
  useEffect(() => {
    function update() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      setScrollFraction(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  // Current section: home page only, via IntersectionObserver against each
  // section's own id. A section counts as "current" once it has crossed
  // roughly the top third of the viewport, the standard scrollspy line.
  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === 'undefined') return
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const idx = elements.indexOf(entry.target as HTMLElement)
          if (idx !== -1) setActiveIndex(idx)
        }
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [isHome])

  const currentSection = isHome ? SECTIONS[activeIndex] : undefined
  const currentLabel = currentSection?.label ?? routeLabel(pathname)
  const positionLabel = isHome
    ? `${String(activeIndex + 1).padStart(2, '0')}/${String(SECTIONS.length).padStart(2, '0')}`
    : null
  const percent = Math.round(scrollFraction * 100)

  function isActive(href: string): boolean {
    if (href === '/research') return pathname === '/research'
    if (href === '/resume') return false
    return isHome && currentSection?.href === href
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
          <span className="shrink-0 tabular-nums text-label/70">{percent}%</span>
        </p>

        <ul className="hidden items-center gap-6 md:flex">
          {DESTINATIONS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'true' : undefined}
                className="text-14 text-label transition-colors hover:text-bone aria-[current=true]:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3 md:hidden">
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
          {DESTINATIONS.map((link) => (
            <li key={link.href} className="border-b border-grid last:border-b-0">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.href) ? 'true' : undefined}
                className="block py-3 text-16 text-bone aria-[current=true]:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
