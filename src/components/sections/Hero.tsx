import { identity } from '@/content'
import { ActionLink } from '@/components/primitives/ActionLink'
import { HeroField } from '@/components/graphics/HeroField'
import { HeroCanvas } from '@/components/sections/HeroCanvas'

// Asymmetric split: headline left-weighted across 8 of 12 columns, meta and
// CTAs anchored bottom-right in the remaining negative space. -mt-16 cancels
// the fixed nav's clearance on <main> so this section still measures a true
// min-h-[100dvh] from the real top of the viewport. Exactly four text
// elements below the h1: the combined role/strapline line, the combined
// location/availability line, and the CTA row.
//
// HeroField sits on the graticule ground as the page's largest visual
// element and its thesis: it is decorative relative to the four text nodes
// above (aria-hidden, purely additive), so it is dropped below md rather
// than resized, keeping the mobile hero to name, role and the two links.
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="graticule relative -mt-16 flex min-h-[100dvh] items-center overflow-hidden border-b border-grid pt-20 pb-16 sm:pt-24"
    >
      {/* The field is a substrate, not the subject. At full strength the flow
          reads as a generic mesh-gradient background and competes with the
          lattice, the trace and the strapline; held back it behaves like the
          measurement noise the drawn layer resolves out of. */}
      <HeroCanvas className="pointer-events-none absolute inset-0 overflow-hidden opacity-50" />

      <HeroField className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-90 md:block" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-12 px-6 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8">
          <h1
            id="hero-heading"
            className="font-display text-104 leading-[0.9] tracking-[-0.03em] text-bone text-balance sm:text-160"
          >
            {identity.name}
          </h1>
          <p className="mt-6 max-w-[38ch] text-18 leading-relaxed text-label sm:text-22">
            {identity.title}. {identity.strapline}.
          </p>
        </div>

        <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:items-end lg:text-right">
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
