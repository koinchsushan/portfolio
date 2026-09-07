import { identity } from '@/content'
import { ExternalLink } from '@/components/primitives/ExternalLink'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-grid">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-12 text-label">
          © {year} {identity.name}
        </p>
        <ul aria-label="Contact links" className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-12 text-label">
          <li>
            <a
              href={`mailto:${identity.email}`}
              className="transition-colors hover:text-bone focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-4"
            >
              {identity.email}
            </a>
          </li>
          <li>
            <ExternalLink href={`https://${identity.linkedin}`}>{identity.linkedin}</ExternalLink>
          </li>
          <li>
            <ExternalLink href={`https://${identity.github}`}>{identity.github}</ExternalLink>
          </li>
        </ul>
      </div>
    </footer>
  )
}
