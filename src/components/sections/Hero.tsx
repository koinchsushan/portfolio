import { identity } from '@/content'

/** The page's single h1. */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading">
      <h1 id="hero-heading">{identity.name}</h1>
      <p>{identity.title}</p>
      <p>{identity.strapline}</p>
      <p>{identity.location}</p>
      <p>{identity.availability}</p>
      <p>
        <a href="#work">View work</a>
        {' · '}
        <a href="#contact">Get in touch</a>
      </p>
    </section>
  )
}
