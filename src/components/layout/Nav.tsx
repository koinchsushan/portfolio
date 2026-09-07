'use client'

import { useState } from 'react'
import Link from 'next/link'
import { List, X } from '@phosphor-icons/react/dist/ssr'

const links = [
  { href: '/', label: 'Home' },
  { href: '/#work', label: 'Selected Work' },
  { href: '/research', label: 'Research' },
  { href: '/#trajectory', label: 'Trajectory' },
  { href: '/#contact', label: 'Contact' },
  { href: '/resume', label: 'Résumé' },
]

/** Site-wide primary navigation. One line at desktop, <=64px tall, collapses to a disclosure below 768px. */
export function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-grid bg-ground/90 backdrop-blur-sm">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <Link
          href="/"
          className="font-mono text-14 text-bone transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
        >
          Sushan Sunuwar
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-14 text-label transition-colors hover:text-bone focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-[var(--radius)] p-2 text-bone md:hidden focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
        >
          {open ? <X size={20} aria-hidden /> : <List size={20} aria-hidden />}
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </nav>

      {open && (
        <ul id="mobile-nav" className="border-t border-grid px-6 py-2 md:hidden">
          {links.map((link) => (
            <li key={link.href} className="border-b border-grid last:border-b-0">
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-16 text-bone focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
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
