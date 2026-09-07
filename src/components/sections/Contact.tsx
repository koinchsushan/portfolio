import Link from 'next/link'
import { identity } from '@/content'
import { ExternalLink } from '@/components/primitives/ExternalLink'

// Full-bleed closing statement: one dominant amber CTA (--signal used once
// per viewport, exactly per spec) instead of a bulleted contact list, with
// the secondary links reduced to a quiet rule-topped row underneath.
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="graticule">
      <div className="mx-auto max-w-[1400px] px-6 py-32 sm:py-40">
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

        <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-grid pt-8 font-mono text-14">
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
    </section>
  )
}
