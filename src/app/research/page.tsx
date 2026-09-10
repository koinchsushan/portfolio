import type { Metadata } from 'next'
import { research } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'
import { ExternalLink } from '@/components/primitives/ExternalLink'

const description = `Three research projects: ${research.map((item) => item.title).join(', ')}.`

export const metadata: Metadata = {
  title: 'Research',
  description,
  alternates: { canonical: '/research' },
  openGraph: {
    type: 'website',
    url: '/research',
    title: 'Research',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research',
    description,
  },
}

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-16 sm:py-20">
      <h1 id="research-page-heading" className="text-64 leading-[0.95] tracking-[-0.03em] text-bone sm:text-104">
        Research
      </h1>

      <ul aria-labelledby="research-page-heading" className="mt-14 border-t border-grid">
        {research.map((item) => (
          <li key={item.repo} className="grid grid-cols-1 gap-6 border-b border-grid py-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="text-28 tracking-[-0.01em] text-bone">{item.title}</h2>
              {item.draft ? (
                <DraftNote>
                  <p className="mt-3 max-w-[64ch] text-16 leading-relaxed text-label">{item.blurb}</p>
                </DraftNote>
              ) : (
                <p className="mt-3 max-w-[64ch] text-16 leading-relaxed text-label">{item.blurb}</p>
              )}
              {item.stack && (
                <ul aria-label={`${item.title} technologies`} className="mt-5 flex flex-wrap gap-2">
                  {item.stack.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-[var(--radius)] border border-grid px-2 py-1 font-mono text-12 text-label"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-12">
                {item.year && (
                  <>
                    <dt className="text-label">Year</dt>
                    <dd className="text-bone">{item.year}</dd>
                  </>
                )}
                {item.licence && (
                  <>
                    <dt className="text-label">Licence</dt>
                    <dd className="text-bone">{item.licence}</dd>
                  </>
                )}
                {typeof item.forks === 'number' && (
                  <>
                    <dt className="text-label">Forks</dt>
                    <dd className="text-bone">{item.forks}</dd>
                  </>
                )}
                {item.liveDemo === true && (
                  <>
                    <dt className="text-label">Live demo</dt>
                    <dd className="text-bone">Available</dd>
                  </>
                )}
              </dl>
              <p className="mt-5">
                <ExternalLink href={`https://${item.repo}`} className="text-14 text-label">
                  View repository
                </ExternalLink>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
