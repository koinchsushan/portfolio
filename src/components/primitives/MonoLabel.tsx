import type { ElementType, ReactNode } from 'react'

/**
 * Small monospace text: dates, tags, units, stack chips, metadata rails.
 * `eyebrow` opts into the uppercase, wide-tracking treatment that reads as
 * a section label above a heading. That treatment is capped at three uses
 * across the home page (see task-B-brief.md), so most call sites leave it
 * off and get plain mono instead.
 */
export function MonoLabel({
  children,
  as: Tag = 'span',
  eyebrow = false,
  className = '',
}: {
  children: ReactNode
  as?: ElementType<{ className?: string; children?: ReactNode }>
  eyebrow?: boolean
  className?: string
}) {
  const eyebrowClass = eyebrow ? 'uppercase tracking-[0.14em] text-signal' : 'text-muted'
  return <Tag className={`font-mono text-12 ${eyebrowClass} ${className}`}>{children}</Tag>
}
