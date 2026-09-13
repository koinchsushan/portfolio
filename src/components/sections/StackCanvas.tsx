'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useCapability } from '@/lib/useCapability'
import { stackFaces } from '@/content/stackFaces'
import { StackSilhouette } from '@/components/graphics/StackSilhouette'
import type { StackPalette } from '@/components/three/StackObject'

/**
 * Resolves the live palette from `tokens.css`, the same pattern `HeroCanvas`
 * uses for the hero shader: the object inherits the site's palette rather
 * than carrying a second copy of it, and a missing token means the WebGL
 * layer never mounts (the SVG still renders, so the section is never empty).
 */
function readStackPalette(): StackPalette | null {
  const style = getComputedStyle(document.documentElement)
  const label = style.getPropertyValue('--label').trim()
  const bone = style.getPropertyValue('--bone').trim()
  const signal = style.getPropertyValue('--signal').trim()
  const panel = style.getPropertyValue('--panel').trim()
  const grid = style.getPropertyValue('--grid').trim()
  if (!label || !bone || !signal || !panel || !grid) return null
  return { label, bone, signal, panel, grid }
}

// `ssr: false` keeps `three` and `simple-icons` out of the server bundle and
// the initial client chunk: the import only resolves once this component
// actually renders it, which only happens once the section is within a
// screenful of the viewport on `full`- or `lite`-tier hardware.
const StackObjectView = dynamic(() => import('@/components/three/StackObject').then((mod) => mod.StackObject), {
  ssr: false,
})

const ARROW_STEP_RADIANS = 0.16

/** How far ahead of the viewport the WebGL object starts building itself.
 *  Roughly a screenful: long enough to cover the fetch, the evaluate and the
 *  mount at normal scrolling speed, short enough that a reader who never
 *  reaches this section never pays for it. */
const MOUNT_MARGIN = '1200px 0px'

/**
 * The cursor-reactive stack object (Task G). Layered exactly like
 * `HeroCanvas`: a lightweight, always-rendered visual (`StackSilhouette`,
 * an SVG projection of the same baked geometry) sits at fixed dimensions in
 * every tier, with the interactive WebGL object mounted on top of it once
 * the section has intersected, on `full` and `lite` hardware only.
 *
 * The accessible layer , 32 real, individually focusable buttons (one per
 * face, carrying its name and, where the content supports one, a line of
 * real usage context) plus a live-updating label , renders unconditionally
 * in every tier, including `static`. Capability only ever degrades the
 * *rendering* of the object, never the information it carries.
 */
export function StackCanvas({ className }: { className?: string }) {
  const { tier } = useCapability()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasIntersected, setHasIntersected] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [palette, setPalette] = useState<StackPalette | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [rotationOffset, setRotationOffset] = useState({ x: 0, y: 0 })

  const interactive = tier === 'full' || tier === 'lite'

  useEffect(() => {
    if (!interactive) return
    setPalette(readStackPalette())
  }, [interactive])

  useEffect(() => {
    if (!interactive) return
    const node = containerRef.current
    if (!node) return

    // Two observers, because building the object and running it want
    // different moments.
    //
    // Building was happening exactly when the reader arrived: measured on
    // production, 308ms to get the canvas into the DOM (the chunk has to be
    // fetched and evaluated first) and 743ms to the first draw. For that three
    // quarters of a second the section showed the bare silhouette, so the
    // first thing anyone saw of the object was a blank solid with no
    // technologies on it. This observer fires a screenful early, so the chunk
    // loads and `StackObject` builds its renderer, compiles its shaders and
    // draws its first frame while the section is still below the fold.
    // Mounting early was not enough on its own, twice over: R3F's scroll
    // debounce kept the renderer from existing until scrolling stopped
    // (`CANVAS_RESIZE` there), and a paused canvas would still have deferred
    // its first frame to arrival (`WarmUp` there).
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setHasIntersected(true)
        preload.disconnect()
      },
      { rootMargin: MOUNT_MARGIN },
    )
    preload.observe(node)

    // The render loop still starts and stops on the real edge of the
    // viewport: an object built early must not also be animating early.
    const visibility = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), {
      threshold: 0,
    })
    visibility.observe(node)

    return () => {
      preload.disconnect()
      visibility.disconnect()
    }
  }, [interactive])

  useEffect(() => {
    if (!interactive) return

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
  }, [interactive])

  const activeFace = useMemo(() => {
    const index = hoveredIndex ?? activeIndex
    return index === null ? null : stackFaces[index]
  }, [hoveredIndex, activeIndex])

  function handleArrowKey(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        setRotationOffset((prev) => ({ ...prev, y: prev.y - ARROW_STEP_RADIANS }))
        break
      case 'ArrowRight':
        event.preventDefault()
        setRotationOffset((prev) => ({ ...prev, y: prev.y + ARROW_STEP_RADIANS }))
        break
      case 'ArrowUp':
        event.preventDefault()
        setRotationOffset((prev) => ({ ...prev, x: prev.x - ARROW_STEP_RADIANS }))
        break
      case 'ArrowDown':
        event.preventDefault()
        setRotationOffset((prev) => ({ ...prev, x: prev.x + ARROW_STEP_RADIANS }))
        break
    }
  }

  return (
    <div className={className}>
      <div ref={containerRef} className="relative aspect-square w-full overflow-hidden" aria-hidden="true">
        <StackSilhouette className="absolute inset-0 h-full w-full" />
        {interactive && hasIntersected && palette && (
          <StackObjectView
            paused={!isVisible}
            palette={palette}
            mode={tier as 'full' | 'lite'}
            activeIndex={activeIndex}
            hoveredIndex={tier === 'full' ? hoveredIndex : null}
            rotationOffset={rotationOffset}
            onHoverFace={setHoveredIndex}
            onSelectFace={(index) => setActiveIndex((prev) => (prev === index ? null : index))}
          />
        )}
      </div>

      <div
        role="group"
        aria-label="Interactive technology stack model. Arrow keys rotate it. Tab through the technologies below, Enter opens where each was used."
        onKeyDown={handleArrowKey}
        className="mt-4 flex flex-wrap gap-1"
      >
        {stackFaces.map((face, index) => (
          <button
            key={face.skill}
            type="button"
            onClick={() => setActiveIndex((prev) => (prev === index ? null : index))}
            onFocus={() => setHoveredIndex(index)}
            onBlur={() => setHoveredIndex((prev) => (prev === index ? null : prev))}
            className="sr-only rounded-[var(--radius)] border border-grid bg-panel px-2 py-1 font-mono text-12 leading-none text-bone focus:not-sr-only"
          >
            {face.label ?? face.skill}
            {face.context ? `. ${face.context}` : ''}
          </button>
        ))}
      </div>

      {/* min-h is sized for the longest skill/context pair in stackFaces.ts
          (Chart.js's, three wrapped lines at this 280px panel width), so
          focusing any face , including the longest one , never reflows the
          page (Task K). Measured, not guessed: see task-K-report.md. */}
      <p aria-live="polite" className="mt-3 min-h-[6em] font-mono text-14 text-label">
        {activeFace ? (
          <>
            <span className="text-bone">{activeFace.label ?? activeFace.skill}</span>
            {activeFace.context ? <span> , {activeFace.context}</span> : null}
          </>
        ) : (
          'Focus or tap a technology to see where it was used.'
        )}
      </p>
    </div>
  )
}
