import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { ReactNode } from 'react'

/**
 * A CTA-weight link: internal (Next `Link`, e.g. "#work") or a mailto/tel
 * style href. Not for links that open a new tab, use `ExternalLink` there.
 */
export function ActionLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'quiet'
  className?: string
}) {
  const base =
    'group inline-flex items-center gap-2 font-mono text-14 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4'
  const styles =
    variant === 'primary'
      ? 'text-bone hover:text-signal'
      : 'text-label hover:text-bone'

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
      <ArrowRight
        weight="bold"
        aria-hidden
        className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
      />
    </Link>
  )
}
