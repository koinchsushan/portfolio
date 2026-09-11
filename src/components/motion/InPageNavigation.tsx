'use client'

import { useEffect } from 'react'
import { scrollToTarget } from '@/lib/smoothScroll'

/**
 * Owns every same-page jump on the home page: the nav's section links, the
 * hero CTAs, the Home link and the logo. Renders nothing.
 *
 * Without it, those clicks fell through to Next's router, which does nothing
 * for the URL you are already on. Clicking Trajectory while the address bar
 * already read `/#trajectory` left the page where it was, and Home or the
 * logo never returned to the top from mid-page. Here the click always
 * scrolls, whatever the current hash is.
 *
 * Scope is deliberately narrow: only links whose resolved URL is the home
 * page itself (with no hash, meaning the top) or a hash naming one of its
 * `<section>`s. Anything else keeps native behaviour, most importantly the
 * skip link, whose `#main` target is not a section and must still move focus
 * the way the browser does. Cross-page links (for example Work from
 * `/research`) are left to the router, and the root's `scroll-padding-top`
 * in globals.css lands those under the header too.
 *
 * Capture phase, like `RouteTransition`, so `preventDefault` is set before
 * `next/link`'s own handler runs and it steps aside. React `onClick`
 * handlers, such as the mobile menu closing itself, still fire.
 */
export function InPageNavigation() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as HTMLElement | null)?.closest('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      let url: URL
      try {
        url = new URL(anchor.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname !== '/' || window.location.pathname !== '/') return
      if (url.search !== window.location.search) return

      const id = decodeURIComponent(url.hash.slice(1))
      let target: HTMLElement | null = null
      if (id) {
        const el = document.getElementById(id)
        if (!el || el.tagName !== 'SECTION') return
        target = el
      }

      event.preventDefault()
      scrollToTarget(target)
      // Keep the address bar honest about where the reader went, without a
      // router navigation. Next 16 integrates native history calls.
      window.history.replaceState(null, '', id ? `/#${id}` : '/')
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
