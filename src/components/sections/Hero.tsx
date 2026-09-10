'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { identity } from '@/content'
import { ActionLink } from '@/components/primitives/ActionLink'
import { HeroField } from '@/components/graphics/HeroField'
import { HeroCanvas } from '@/components/sections/HeroCanvas'
import { useRevealText } from '@/lib/useRevealText'
import type { AvoidBox } from '@/components/graphics/geometry'

/**
 * Converts a screen-space rectangle (already padded) into `HeroField`'s own
 * SVG viewBox units, inverting the `preserveAspectRatio="xMidYMid slice"`
 * cover-fit transform by hand: uniform scale is whichever axis needs to grow
 * more to cover the container, and the image is centred on the overflowing
 * axis. Same maths a browser applies internally; done here explicitly
 * because the lattice needs to know, in its own coordinate space, exactly
 * where the live-measured text rectangle landed.
 */
function toViewBoxRect(svg: SVGSVGElement, screenRect: { left: number; top: number; right: number; bottom: number }): AvoidBox | null {
  const svgRect = svg.getBoundingClientRect()
  const viewBox = svg.viewBox.baseVal
  if (svgRect.width === 0 || svgRect.height === 0 || viewBox.width === 0 || viewBox.height === 0) return null

  const scale = Math.max(svgRect.width / viewBox.width, svgRect.height / viewBox.height)
  const renderedW = viewBox.width * scale
  const renderedH = viewBox.height * scale
  const offsetX = svgRect.left - (renderedW - svgRect.width) / 2
  const offsetY = svgRect.top - (renderedH - svgRect.height) / 2

  return {
    x: (screenRect.left - offsetX) / scale,
    y: (screenRect.top - offsetY) / scale,
    w: (screenRect.right - screenRect.left) / scale,
    h: (screenRect.bottom - screenRect.top) / scale,
  }
}

/** Screen-space padding, in px, added around the measured meta/CTA block
 *  before it is converted into lattice units, so the clear region reads as
 *  a deliberate gap rather than a rectangle traced exactly onto the glyphs. */
const AVOID_PADDING_PX = 16

// Asymmetric split: headline left-weighted across 8 of 12 columns, meta and
// CTAs anchored bottom-right in the remaining negative space. -mt-16 cancels
// the fixed nav's clearance on <main> so this section still measures a true
// min-h-[100dvh] from the real top of the viewport. Exactly four text
// elements below the h1: the combined role/strapline line, the combined
// location/availability line, and the CTA row.
//
// HeroField is the page's largest visual element and its thesis: it is
// decorative relative to the four text nodes above (aria-hidden, purely
// additive), so it is dropped below md rather than resized, keeping the
// mobile hero to name, role and the two links.
//
// The two hero lines (the name, then the role/strapline underneath it) carry
// the site's one text-motion idea: they resolve out of a soft blur on
// mount, staggered slightly so the name settles a beat before the line
// under it does, the same thesis the lattice draws at page scale.
export function Hero() {
  const name = useRevealText<HTMLHeadingElement>('immediate')
  const strapline = useRevealText<HTMLParagraphElement>('immediate')

  const fieldRef = useRef<SVGSVGElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const [avoidBox, setAvoidBox] = useState<AvoidBox | null>(null)

  // Keeps the lattice's clear region locked to the meta/CTA block's real,
  // rendered position (task-O finding 4): the block moves from a full-width
  // row to a bottom-right column between the md and lg breakpoints, so a
  // fixed guess would drift out of alignment at exactly the widths where the
  // collision used to happen. Re-measured on resize; safe to skip when the
  // field or the block have not mounted (server render, reduced motion has
  // no bearing here since this is layout, not animation).
  useLayoutEffect(() => {
    function measure() {
      const svg = fieldRef.current
      const block = metaRef.current
      if (!svg || !block) {
        setAvoidBox(null)
        return
      }
      const r = block.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) {
        setAvoidBox(null)
        return
      }
      setAvoidBox(
        toViewBoxRect(svg, {
          left: r.left - AVOID_PADDING_PX,
          top: r.top - AVOID_PADDING_PX,
          right: r.right + AVOID_PADDING_PX,
          bottom: r.bottom + AVOID_PADDING_PX,
        }),
      )
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative -mt-16 flex min-h-[100dvh] items-center overflow-hidden border-b border-grid pt-20 pb-16 sm:pt-24"
    >
      {/* The field is a substrate, not the subject. At full strength the flow
          reads as a generic mesh-gradient background and competes with the
          lattice, the trace and the strapline; held back it behaves like the
          measurement noise the drawn layer resolves out of. */}
      <HeroCanvas className="pointer-events-none absolute inset-0 overflow-hidden opacity-50" />

      <HeroField
        ref={fieldRef}
        avoidBox={avoidBox}
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-90 md:block"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <h1
            id="hero-heading"
            ref={name.ref}
            className={`font-display text-104 ${name.className} leading-[0.9] tracking-[-0.04em] text-bone text-balance sm:text-160`}
          >
            {identity.name}
          </h1>
          <p
            ref={strapline.ref}
            style={{ transitionDelay: '120ms' }}
            className={`mt-6 max-w-[38ch] text-18 ${strapline.className} leading-relaxed text-label sm:text-22`}
          >
            {identity.title}. {identity.strapline}.
          </p>
        </div>

        <div ref={metaRef} className="flex flex-col justify-end gap-6 lg:col-span-4 lg:items-end lg:text-right">
          <p className="font-mono text-14 text-label">
            {identity.location} · {identity.availability}
          </p>
          <p className="flex gap-8 lg:justify-end">
            <ActionLink href="#work">View work</ActionLink>
            <ActionLink href="#contact" variant="quiet">
              Get in touch
            </ActionLink>
          </p>
        </div>
      </div>
    </section>
  )
}
