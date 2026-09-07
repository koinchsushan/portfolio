'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useCapability } from '@/lib/useCapability'
import type { HeroPalette } from '@/components/three/HeroField'

/**
 * Resolve the palette from the live custom properties, so the shader inherits
 * `tokens.css` rather than carrying its own copy of it. Returns null if a
 * token is missing (renamed, stylesheet not applied), and the caller then
 * falls back to the lite mesh rather than drawing in wrong colours.
 */
function readPalette(): HeroPalette | null {
  const style = getComputedStyle(document.documentElement)
  const ground = style.getPropertyValue('--ground').trim()
  const depth = style.getPropertyValue('--depth').trim()
  const signal = style.getPropertyValue('--signal').trim()
  if (!ground || !depth || !signal) return null
  return { ground, depth, signal }
}

// `ssr: false` only works inside a Client Component (this file), and it is
// what keeps `three` and `@react-three/fiber` out of the server bundle and
// out of the initial client chunk: the import only resolves once this
// component actually renders the dynamic component, which only happens
// after the hero has intersected on `full`-tier hardware.
const WebGLHeroField = dynamic(() => import('@/components/three/HeroField').then((mod) => mod.HeroField), {
  ssr: false,
})

/**
 * The layer behind the drawn SVG lattice (`components/graphics/HeroField`,
 * left untouched). That SVG renders immediately and unconditionally in
 * every tier at fixed dimensions; this component only ever adds an
 * absolutely-positioned overlay behind it, so mounting or swapping it never
 * shifts layout.
 *
 *   full   , the WebGL curl-noise field, mounted only once the hero has
 *            actually intersected the viewport, then paused (not
 *            unmounted) via `frameloop` whenever it scrolls off-screen or
 *            the tab is hidden.
 *   lite   , an animated CSS gradient mesh, no WebGL at all.
 *   static , nothing. No canvas element, no extra DOM.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const { tier } = useCapability()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [palette, setPalette] = useState<HeroPalette | null>(null)

  useEffect(() => {
    if (tier !== 'full') return
    setPalette(readPalette())
  }, [tier])

  useEffect(() => {
    if (tier !== 'full') return
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (entry.isIntersecting) setHasIntersected(true)
      },
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [tier])

  useEffect(() => {
    if (tier !== 'full') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsVisible(false)
        return
      }
      const node = containerRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      setIsVisible(rect.bottom > 0 && rect.top < window.innerHeight)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [tier])

  if (tier === 'static') return null

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {(tier === 'lite' || (tier === 'full' && !palette)) && (
        <div className="hero-gradient-mesh absolute inset-0" />
      )}
      {tier === 'full' && hasIntersected && palette && (
        <WebGLHeroField paused={!isVisible} palette={palette} />
      )}
    </div>
  )
}
