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
  const muted = style.getPropertyValue('--label').trim()
  const signal = style.getPropertyValue('--signal').trim()
  if (!ground || !muted || !signal) return null
  return { ground, muted, signal }
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
 *   full   , the WebGL curl-noise field at up to 1.5x device pixels.
 *   lite   , the same field, capped at 1x device pixels.
 *   static , nothing. No canvas element, no extra DOM.
 *
 * `lite` used to get a CSS gradient mesh instead, on a no-WebGL-on-phones
 * rule. On a phone the drawn lattice is dropped too (a 24x9 field
 * cover-fitted into a portrait viewport crops away its own trace), so that
 * left the mobile hero with a soft gradient and nothing else: no object, no
 * visible motion. The owner asked for the real thing there, so the field
 * mounts on `lite` as well, at half the pixels. Everything protective stays:
 * it mounts only once the hero has intersected, pauses via `frameloop` when
 * it scrolls away or the tab hides, and `static` (which is where
 * `prefers-reduced-motion` lands) still gets no canvas at all.
 *
 * The gradient mesh survives as the fallback for the moments and devices
 * with no field: before the first intersection, and when the palette cannot
 * be read from the stylesheet.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const { tier } = useCapability()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [palette, setPalette] = useState<HeroPalette | null>(null)

  const wantsField = tier === 'full' || tier === 'lite'

  useEffect(() => {
    if (!wantsField) return
    setPalette(readPalette())
  }, [wantsField])

  useEffect(() => {
    if (!wantsField) return
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
  }, [wantsField])

  useEffect(() => {
    if (!wantsField) return

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
  }, [wantsField])

  if (tier === 'static') return null

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      {(!palette || !hasIntersected) && <div className="hero-gradient-mesh absolute inset-0" />}
      {wantsField && hasIntersected && palette && (
        <WebGLHeroField paused={!isVisible} palette={palette} dprMax={tier === 'lite' ? 1 : 1.5} />
      )}
    </div>
  )
}
