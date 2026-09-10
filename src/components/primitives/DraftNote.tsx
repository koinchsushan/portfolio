import type { ReactNode } from 'react'

/**
 * Wraps copy that goes beyond what `src/content/` states verbatim , a
 * best-effort synthesis the owner still needs to read and rewrite. Always
 * renders a visible marker alongside its children; never hides the marker
 * (some content here may be materially wrong until the owner confirms it).
 *
 * `bordered` defaults to the amber left rule (still right for a dense chip
 * plate like Stack or Research, where the rule doubles as a visual divider).
 * About turns it off (Task K): a single long-form column reads better with
 * no accent bar competing with the body copy, the DRAFT marker alone is
 * enough of a flag.
 */
export function DraftNote({
  children,
  bordered = true,
  className = '',
}: {
  children: ReactNode
  bordered?: boolean
  className?: string
}) {
  return (
    <div data-draft="true" className={`${bordered ? 'border-l-2 border-signal pl-4' : ''} ${className}`.trim()}>
      {children}
      <p className="mt-3 font-mono text-12 text-signal">
        <strong className="font-mono font-normal">DRAFT: owner to rewrite</strong>
      </p>
    </div>
  )
}
