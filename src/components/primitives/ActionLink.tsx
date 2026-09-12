import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { ReactNode } from 'react'

/**
 * A CTA-weight link: internal (Next `Link`, e.g. "#work") or a mailto/tel
 * style href. Not for links that open a new tab, use `ExternalLink` there.
 *
 * `datum` opts the link into the site's hover vocabulary: an accent hairline
 * drawing under the label, and a 1px press on tap. It is a prop rather than
 * the default because the hero's two CTAs are deliberately left exactly as
 * they are, and they are the only call sites that omit it.
 */
export function ActionLink({
  href,
  children,
  variant = 'primary',
  datum = false,
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'quiet'
  datum?: boolean
  className?: string
}) {
  const base =
    'group inline-flex items-center gap-2 font-mono text-14 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4'
  const styles =
    variant === 'primary'
      ? 'text-bone hover:text-signal'
      : 'text-label hover:text-bone'

  return (
    <Link href={href} className={`${base} ${styles} ${datum ? 'press' : ''} ${className}`}>
      <span className={datum ? 'link-datum' : undefined}>{children}</span>
      <ArrowRight
        weight="bold"
        aria-hidden
        className="size-3.5 transition-transform duration-[var(--dur-hover)] ease-[var(--ease-resolve)] group-hover:translate-x-1"
      />
    </Link>
  )
}
