/** First focusable element on every page; jumps past Nav straight to `#main`. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[var(--radius)] focus:bg-signal focus:px-4 focus:py-2 focus:font-mono focus:text-14 focus:text-ground focus:outline-2 focus:outline-offset-4 focus:outline-signal"
    >
      Skip to content
    </a>
  )
}
