import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import type { ReactNode } from 'react'

/** An outbound anchor: new tab, arrow glyph, and the sr-only tab announcement every external link on this site carries. */
export function ExternalLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={`press group inline-flex items-center gap-1.5 underline decoration-grid decoration-1 underline-offset-4 transition-colors duration-[var(--dur-hover)] hover:text-signal hover:decoration-signal focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4 ${className}`}
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
      <ArrowUpRight
        weight="bold"
        aria-hidden
        className="size-3 shrink-0 transition-transform duration-[var(--dur-hover)] ease-[var(--ease-resolve)] group-hover:-translate-y-1 group-hover:translate-x-1"
      />
    </a>
  )
}
