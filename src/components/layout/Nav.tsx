import Link from 'next/link'

/** Site-wide primary navigation. Anchors point at the home page's own section ids. */
export function Nav() {
  return (
    <nav aria-label="Primary">
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/#work">Selected Work</Link>
        </li>
        <li>
          <Link href="/research">Research</Link>
        </li>
        <li>
          <Link href="/#trajectory">Trajectory</Link>
        </li>
        <li>
          <Link href="/#contact">Contact</Link>
        </li>
        <li>
          <Link href="/resume">Résumé</Link>
        </li>
      </ul>
    </nav>
  )
}
