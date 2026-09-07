import { identity } from '@/content'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <p>
        © {year} {identity.name}
      </p>
      <ul aria-label="Contact links">
        <li>
          <a href={`mailto:${identity.email}`}>{identity.email}</a>
        </li>
        <li>
          <a href={`https://${identity.linkedin}`} target="_blank" rel="noreferrer noopener">
            {identity.linkedin}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
        <li>
          <a href={`https://${identity.github}`} target="_blank" rel="noreferrer noopener">
            {identity.github}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      </ul>
    </footer>
  )
}
