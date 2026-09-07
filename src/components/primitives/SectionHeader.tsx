import type { ElementType, ReactNode } from 'react'
import { MonoLabel } from './MonoLabel'

/**
 * A section's heading, optionally paired with a lede and, rarely, an
 * eyebrow. Deliberately does not add an eyebrow by default: most sections
 * on the home page read fine from the headline alone.
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
  as?: ElementType<{ id?: string; className?: string; children?: ReactNode }>
  className?: string
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <MonoLabel eyebrow className="mb-3 block">
          {eyebrow}
        </MonoLabel>
      )}
      <Tag id={id} className={`font-display ${headingSize} leading-[0.95] tracking-[-0.02em] text-bone text-balance`}>
        {heading}
      </Tag>
      {lede && <p className="mt-4 max-w-[42ch] text-16 leading-relaxed text-label">{lede}</p>}
    </div>
  )
}
