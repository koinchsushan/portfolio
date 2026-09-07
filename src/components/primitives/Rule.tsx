/** A single hairline, the graticule's basic unit. Never paired top and bottom on the same row. */
export function Rule({ className = '', vertical = false }: { className?: string; vertical?: boolean }) {
  if (vertical) {
    return <span aria-hidden className={`block w-px self-stretch bg-grid ${className}`} />
  }
  return <hr className={`border-0 border-t border-grid ${className}`} />
}
