/** First focusable element on every page; jumps past Nav straight to `#main`. */
export function SkipLink() {
  return (
    <a href="#main" className="sr-only focus:not-sr-only">
      Skip to content
    </a>
  )
}
