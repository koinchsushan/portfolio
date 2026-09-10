'use client'

import { identity } from '@/content'
import { ActionLink } from '@/components/primitives/ActionLink'
import { HeroField } from '@/components/graphics/HeroField'
import { HeroCanvas } from '@/components/sections/HeroCanvas'
import { useRevealText } from '@/lib/useRevealText'

/**
 * Converts a screen-space rectangle (already padded) into `HeroField`'s own
 * SVG viewBox units, inverting the `preserveAspectRatio="xMidYMid slice"`
 * cover-fit transform by hand: uniform scale is whichever axis needs to grow
 * more to cover the container, and the image is centred on the overflowing
 * axis. Same maths a browser applies internally; done here explicitly
 * because the lattice needs to know, in its own coordinate space, exactly
 * where the live-measured text rectangle landed.
 */
/** Screen-space padding, in px, added around the measured meta/CTA block
 *  before it is converted into lattice units, so the clear region reads as
 *  a deliberate gap rather than a rectangle traced exactly onto the glyphs. */
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
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-90 md:block"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <h1
            id="hero-heading"
            ref={name.ref}
            className={`over-field font-display text-64 ${name.className} leading-[0.92] tracking-[-0.035em] text-bone text-balance sm:text-104`}
          >
            {identity.name}
          </h1>
          <p
            ref={strapline.ref}
            style={{ transitionDelay: '120ms' }}
            className={`over-field mt-6 max-w-[38ch] text-18 ${strapline.className} leading-relaxed text-label sm:text-22`}
          >
            {identity.title}. {identity.strapline}.
          </p>
        </div>

        <div className="over-field flex flex-col justify-end gap-6 lg:col-span-5 lg:items-end lg:text-right">
          <p className="font-mono text-16 text-bone lg:whitespace-nowrap sm:text-18">
            {identity.location} · {identity.availability}
          </p>
          <p className="flex gap-8 text-18 lg:justify-end sm:text-22">
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
