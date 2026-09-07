'use client'

import { startTransition, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { caseStudies } from '@/content'

/** Never let a transition hang the page if navigation is unusually slow. */
const VIEW_TRANSITION_TIMEOUT_MS = 1200

/**
 * Only intercept clicks that land on a route this app actually renders.
 * `/resume` is a Route Handler that streams a PDF, not a page, and any
 * unknown future href should fall through to a plain browser navigation
 * rather than being fed to the client router , degrading to a broken or
 * blank state is exactly the failure this guards against.
 */
function isNavigablePagePath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/research') return true
  const match = pathname.match(/^\/work\/([^/]+)$/)
  return match ? caseStudies.some((cs) => cs.slug === match[1]) : false
}

/**
 * SIGNATURE 3's connective tissue: a wipe between routes built on the
 * browser's View Transitions API, textured with the same noise language as
 * the hero field (`components/three/HeroField.tsx`) via the CSS in
 * `globals.css`, applied here instead of re-running GLSL on every
 * navigation so a route change stays cheap regardless of capability tier.
 *
 * Feature-detected and reduced-motion-gated at the top of the one effect
 * that attaches anything: where `document.startViewTransition` is missing,
 * or the OS asks for reduced motion, this component attaches no listeners
 * at all and every `<Link>` on the site keeps navigating exactly as
 * Next.js already does, instantly and plainly. That is also what every
 * excluded click (external, new tab, download, modified, same page) falls
 * through to.
 */
export function RouteTransition() {
  const router = useRouter()
  const pathname = usePathname()
  const resolveRef = useRef<(() => void) | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // Whenever the route actually finishes changing, release whatever
  // in-flight view transition is waiting on it. That is what lets the
  // transition's "new" snapshot wait for the real (async) navigation to
  // commit, instead of an arbitrary timer racing the page's own data fetch.
  useEffect(() => {
    const resolve = resolveRef.current
    if (!resolve) return
    resolveRef.current = null
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    resolve()
  }, [pathname])

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reducedMotion) return
    if (typeof document.startViewTransition !== 'function') return

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href) return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return
      if (!isNavigablePagePath(url.pathname)) return

      event.preventDefault()

      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve
            timeoutRef.current = window.setTimeout(() => {
              resolveRef.current = null
              resolve()
            }, VIEW_TRANSITION_TIMEOUT_MS)
            startTransition(() => {
              router.push(url.pathname + url.search + url.hash)
            })
          }),
      )
    }

    // Capture phase, deliberately: it has to run before `next/link`'s own
    // bubble-phase click handler, which bails out the moment it sees
    // `defaultPrevented`. That ordering is what lets this component drive
    // the same navigation Next.js already renders, rather than racing it.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [router])

  return null
}
