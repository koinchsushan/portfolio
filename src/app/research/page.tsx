import type { Metadata } from 'next'
import { research } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'

export const metadata: Metadata = {
  title: 'Research',
}

export default function ResearchPage() {
  return (
    <>
      <h1 id="research-page-heading">Research</h1>
      <ul aria-labelledby="research-page-heading">
        {research.map((item) => (
          <li key={item.repo}>
            <h2>{item.title}</h2>
            {item.draft ? (
              <DraftNote>
                <p>{item.blurb}</p>
              </DraftNote>
            ) : (
              <p>{item.blurb}</p>
            )}
            {item.stack && (
              <ul aria-label={`${item.title} technologies`}>
                {item.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            )}
            <dl>
              {item.year && (
                <>
                  <dt>Year</dt>
                  <dd>{item.year}</dd>
                </>
              )}
              {item.licence && (
                <>
                  <dt>Licence</dt>
                  <dd>{item.licence}</dd>
                </>
              )}
              {typeof item.forks === 'number' && (
                <>
                  <dt>Forks</dt>
                  <dd>{item.forks}</dd>
                </>
              )}
              {typeof item.liveDemo === 'boolean' && (
                <>
                  <dt>Live demo</dt>
                  <dd>{item.liveDemo ? 'Yes' : 'No'}</dd>
                </>
              )}
            </dl>
            <p>
              <a href={`https://${item.repo}`} target="_blank" rel="noreferrer noopener">
                View repository
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
