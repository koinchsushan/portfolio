'use client'

import { identity } from '@/content'
import { ExternalLink } from '@/components/primitives/ExternalLink'
import dynamic from 'next/dynamic'
import { useRevealText } from '@/lib/useRevealText'

// Closing composition: one dominant amber CTA (the email link) against a
// quiet right-hand column of real, already-stated facts (location, the
// outbound links) rather than empty space, now that the background grid
// is gone (Task K). Below lg the two columns stack, hairline-divided.
// The form and its Zod schema were 105.8 KB gz of the initial payload, eagerly
// loaded for a control at the very bottom of the page that most visitors never
// reach. Split out and mounted on intersection, matching HeroCanvas. The
// placeholder reserves the form's height so nothing shifts when it arrives.
const ContactForm = dynamic(() => import('@/components/contact/ContactForm').then((m) => m.ContactForm), {
  ssr: false,
  loading: () => <div aria-hidden className="min-h-[26rem]" />,
})

export function Contact() {
  const heading = useRevealText<HTMLHeadingElement>('onView')

  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-[1400px] px-6 py-32 sm:py-40">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <h2
              id="contact-heading"
              ref={heading.ref}
              className={`font-display text-40 ${heading.className} leading-[0.95] tracking-[-0.03em] text-bone sm:text-104`}
            >
              Contact
            </h2>
            <p className="mt-6 max-w-[40ch] text-18 leading-relaxed text-label">{identity.availability}</p>

            {/* Hover used to fade this to 80% opacity, which made the one
                thing the section is asking you to do quieter as you reached
                for it. The rule under it thickens and steps away instead:
                more present, and the same hairline vocabulary as the rest. */}
            <a
              href={`mailto:${identity.email}`}
              className="press mt-10 inline-block font-mono text-28 text-signal underline decoration-1 underline-offset-8 transition-[text-decoration-thickness,text-underline-offset] duration-[var(--dur-hover)] ease-[var(--ease-resolve)] hover:decoration-2 hover:underline-offset-[10px] focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-8 sm:text-40"
            >
              {identity.email}
            </a>
          </div>

          <div className="flex flex-col gap-8 border-t border-grid pt-8 lg:col-span-4 lg:col-start-9 lg:justify-end lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
            <div>
              <p className="font-mono text-12 uppercase tracking-[0.14em] text-label">Based in</p>
              <p className="mt-2 text-16 text-bone">{identity.location}</p>
            </div>
            <ul className="flex flex-col gap-3 font-mono text-14">
              <li>
                <ExternalLink href={`https://${identity.linkedin}`} className="text-label">
                  LinkedIn
                </ExternalLink>
              </li>
              <li>
                <ExternalLink href={`https://${identity.github}`} className="text-label">
                  GitHub
                </ExternalLink>
              </li>
              <li>
                {/* Opens the PDF in its own tab, like the two outbound links above it. */}
                <ExternalLink href="/resume" className="text-label">
                  Résumé (PDF)
                </ExternalLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-12 border-t border-grid pt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:border-l lg:border-grid lg:pl-10">
            <div>
              <p className="font-mono text-12 uppercase tracking-[0.14em] text-label">Reply</p>
              <p className="mt-2 max-w-[32ch] text-14 leading-relaxed text-label">
                I read every message myself and reply from {identity.email}.
              </p>
            </div>
            <div>
              <p className="font-mono text-12 uppercase tracking-[0.14em] text-label">Privacy</p>
              <p className="mt-2 max-w-[32ch] text-14 leading-relaxed text-label">
                Nothing here is stored beyond what it takes to send the email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
