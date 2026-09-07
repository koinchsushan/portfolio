import Link from 'next/link'
import { research } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'

export function Research() {
  return (
    <section aria-labelledby="research-heading">
      <h2 id="research-heading">Research</h2>
      <ul>
        {research.map((item) => (
          <li key={item.repo}>
            <h3>{item.title}</h3>
            {item.draft ? (
              <DraftNote>
                <p>{item.blurb}</p>
              </DraftNote>
            ) : (
              <p>{item.blurb}</p>
            )}
            <p>
              <a href={`https://${item.repo}`} target="_blank" rel="noreferrer noopener">
                View repository
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </p>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/research">Read the full research page</Link>
      </p>
    </section>
  )
}
