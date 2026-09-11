import { research } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'
import { ExternalLink } from '@/components/primitives/ExternalLink'
import { ActionLink } from '@/components/primitives/ActionLink'
import { SectionHeader } from '@/components/primitives/SectionHeader'

// Bento with unequal cells: the flagship study (year, stack, licence, forks)
// gets a large tile; the other two studies, which carry only a title and a
// blurb, share the remaining column as two smaller tiles. The asymmetry is
// real, not decorative: only the flagship carries a public licence and fork
// count, so only it earns the spec-strip treatment below , a rule-divided
// mono metadata row rather than a caption, reading as a data sheet field.
//
// The two smaller tiles show each study's `summary` when it has one. Their
// full blurbs grew to about 105 words each, which made the right column
// taller than the flagship and left roughly 350px of empty space inside the
// flagship tile. The full text still reads on /research, as case studies
// read in full on /work/<slug> while the home page carries the teaser.
//
// The three-column bento starts at xl, not lg. Between 1024 and 1280 the side
// column is only about 260px wide, its tiles wrap into tall columns of text,
// and the flagship beside them was left with a hole of several hundred pixels.
// There the flagship takes a full row and the two studies sit side by side
// below it, which balances by construction: tiles in one row stretch to match.
export function Research() {
  const [flagship, ...rest] = research

  return (
    <section id="research" aria-labelledby="research-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionHeader id="research-heading" heading="Research" headingSize="text-40 sm:text-64" />

        <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-grid bg-grid lg:grid-cols-2 xl:grid-cols-3">
          <li className="flex flex-col justify-between gap-8 bg-ground p-8 lg:col-span-2 lg:p-12 xl:row-span-2">
            <div>
              <h3 className="font-subhead text-28 tracking-[-0.01em] text-bone sm:text-40">{flagship.title}</h3>
              <p className="mt-4 max-w-[60ch] text-16 leading-relaxed text-label">{flagship.blurb}</p>
            </div>
            <div>
              {flagship.stack && (
                <ul aria-label={`${flagship.title} technologies`} className="flex flex-wrap gap-x-4 gap-y-2">
                  {flagship.stack.map((tech) => (
                    <li key={tech} className="font-mono text-12 text-label">
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
              <dl className="mt-6 flex flex-wrap divide-x divide-grid border-t border-grid font-mono text-12 text-label">
                {flagship.year && (
                  <div className="flex gap-1.5 py-2 pr-6">
                    <dt>Year</dt>
                    <dd className="text-bone">{flagship.year}</dd>
                  </div>
                )}
                {flagship.licence && (
                  <div className="flex gap-1.5 py-2 px-6">
                    <dt>Licence</dt>
                    <dd className="text-bone">{flagship.licence}</dd>
                  </div>
                )}
                {typeof flagship.forks === 'number' && (
                  <div className="flex gap-1.5 py-2 pl-6">
                    <dt>Forks</dt>
                    <dd className="text-bone">{flagship.forks}</dd>
                  </div>
                )}
              </dl>
              <p className="mt-6">
                <ExternalLink href={`https://${flagship.repo}`} className="text-14 text-label">
                  View repository
                </ExternalLink>
              </p>
            </div>
          </li>

          {rest.map((item) => (
            <li key={item.repo} className="flex flex-col justify-between gap-6 bg-ground p-8">
              <div>
                <h3 className="font-subhead text-22 tracking-[-0.01em] text-bone">{item.title}</h3>
                {item.draft ? (
                  <DraftNote>
                    <p className="mt-3 text-14 leading-relaxed text-label">{item.summary ?? item.blurb}</p>
                  </DraftNote>
                ) : (
                  <p className="mt-3 text-14 leading-relaxed text-label">{item.summary ?? item.blurb}</p>
                )}
              </div>
              <div>
                {item.stack && (
                  <ul aria-label={`${item.title} technologies`} className="flex flex-wrap gap-x-4 gap-y-2">
                    {item.stack.map((tech) => (
                      <li key={tech} className="font-mono text-12 text-label">
                        {tech}
                      </li>
                    ))}
                  </ul>
                )}
                <p className={item.stack ? 'mt-5' : undefined}>
                  <ExternalLink href={`https://${item.repo}`} className="text-14 text-label">
                    View repository
                  </ExternalLink>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10">
          <ActionLink href="/research" variant="quiet">
            Read the full research page
          </ActionLink>
        </p>
      </div>
    </section>
  )
}
