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
// min-h-[100svh] from the real top of the viewport. Exactly four text
// elements below the h1: the combined role/strapline line, the combined
// location/availability line, and the CTA row.
//
// The height unit is svh, not dvh. dvh follows the mobile browser's address
// bar, so the first touch-scroll grew this section by the bar's height while
// the field canvas kept the height it was last measured at, leaving a band of
// bare ground between the hero and the section under it. svh is the height
// with the bar showing, which is what the page loads at, so the box never
// changes size mid-scroll and there is nothing for the canvas to chase.
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
      className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden border-b border-grid pt-20 pb-16 sm:pt-24"
    >
      {/* Above md the field is a substrate, not the subject: at full strength
          the flow competes with the lattice, the trace and the strapline;
          held back it behaves like the measurement noise the drawn layer
          resolves out of. Below md there is no lattice in front of it, so
          half strength left the hero looking empty and it runs at 90%. */}
      <HeroCanvas className="pointer-events-none absolute inset-0 overflow-hidden opacity-90 md:opacity-50" />

      <HeroField
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-90 md:block"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <h1
            id="hero-heading"
            ref={name.ref}
            className={`over-field font-display text-40 ${name.className} leading-[0.95] tracking-[-0.03em] text-bone sm:text-64`}
          >
            {/* The name leads in quietly and the claim carries the weight, so
                the display type says something about the work rather than
                just labelling the page. Both sit in the one h1 so the
                accessible name stays whole. */}
            <span className="block text-label">{identity.firstName}.</span>
            <span className="block max-w-[15ch]">{identity.tagline}</span>
          </h1>
          <p
            ref={strapline.ref}
            style={{ transitionDelay: '120ms' }}
            className={`over-field mt-6 max-w-[46ch] font-mono text-16 ${strapline.className} leading-relaxed text-label sm:text-18`}
          >
            {identity.title} · {identity.strapline}
          </p>
        </div>

        <div className="over-field flex flex-col justify-end gap-6 lg:col-span-4 lg:items-end lg:text-right">
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
