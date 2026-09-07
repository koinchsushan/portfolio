import Link from 'next/link'
import { identity } from '@/content'

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading">
      <h2 id="contact-heading">Contact</h2>
      <p>{identity.availability}</p>
      <ul>
        <li>
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </li>
        <li>
          <a href={`https://${identity.linkedin}`} target="_blank" rel="noreferrer noopener">
            LinkedIn
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a href={`https://${identity.github}`} target="_blank" rel="noreferrer noopener">
            GitHub
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <Link href="/resume">Résumé (PDF)</Link>
        </li>
      </ul>
    </section>
  )
}
