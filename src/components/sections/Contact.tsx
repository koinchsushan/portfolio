import Link from 'next/link'
import { identity } from '@/content'
import { ExternalLink } from '@/components/primitives/ExternalLink'

// Closing composition: one dominant amber CTA (the email link) against a
// quiet right-hand column of real, already-stated facts (location, the
// outbound links) rather than empty space, now that the background grid
// is gone (Task K). Below lg the two columns stack, hairline-divided.
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading">
      <div className="mx-auto max-w-[1400px] px-6 py-32 sm:py-40">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <h2 id="contact-heading" className="font-display text-40 leading-[0.95] tracking-[-0.02em] text-bone sm:text-104">
              Contact
            </h2>
            <p className="mt-6 max-w-[40ch] text-18 leading-relaxed text-label">{identity.availability}</p>

            <a
              href={`mailto:${identity.email}`}
              className="mt-10 inline-block font-mono text-28 text-signal underline decoration-1 underline-offset-8 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-8 sm:text-40"
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
                <Link
                  href="/resume"
                  className="text-label transition-colors hover:text-bone focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
                >
                  Résumé (PDF)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
