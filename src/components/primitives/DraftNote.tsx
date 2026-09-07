import type { ReactNode } from 'react'

/**
 * Wraps copy that goes beyond what `src/content/` states verbatim , a
 * best-effort synthesis the owner still needs to read and rewrite. Always
 * renders a visible marker alongside its children; never hides the marker
 * (some content here may be materially wrong until the owner confirms it).
 */
export function DraftNote({ children }: { children: ReactNode }) {
  return (
    <div data-draft="true" className="border-l-2 border-signal pl-4">
      {children}
      <p className="mt-3 font-mono text-12 text-signal">
        <strong className="font-mono font-normal">DRAFT: owner to rewrite</strong>
      </p>
    </div>
  )
}
