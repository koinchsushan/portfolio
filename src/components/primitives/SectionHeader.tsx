'use client'

import type { ReactNode } from 'react'
import { MonoLabel } from './MonoLabel'
import { useRevealText } from '@/lib/useRevealText'

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4'

/**
 * A section's heading, optionally paired with a lede and, rarely, an
 * eyebrow. Deliberately does not add an eyebrow by default: most sections
 * on the home page read fine from the headline alone.
 *
 * Every heading built here carries the site's one text-motion idea
 * (`useRevealText`): it resolves out of a soft blur as it scrolls into
 * view, the same thesis as the lattice and the shader stated in type.
 */
export function SectionHeader({
  id,
  eyebrow,
  heading,
  headingSize = 'text-40',
  lede,
  as: Tag = 'h2',
  className = '',
}: {
  id: string
  eyebrow?: string
  heading: ReactNode
  headingSize?: string
  lede?: ReactNode
  as?: HeadingTag
  className?: string
}) {
  const reveal = useRevealText<HTMLHeadingElement>('onView')

  return (
    <div className={className}>
      {eyebrow && (
        <MonoLabel eyebrow className="mb-3 block">
          {eyebrow}
        </MonoLabel>
      )}
      <Tag
        id={id}
        ref={reveal.ref}
        className={`font-display ${headingSize} ${reveal.className} leading-[0.95] tracking-[-0.03em] text-bone text-balance`}
      >
        {heading}
      </Tag>
      {lede && <p className="mt-4 max-w-[42ch] text-16 leading-relaxed text-label">{lede}</p>}
    </div>
  )
}
