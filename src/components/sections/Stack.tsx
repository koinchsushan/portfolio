import { skillGroups } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'
import { SectionHeader } from '@/components/primitives/SectionHeader'

// Plain-text mirror of the ten CV skill groupings. A later task turns this
// into a 3D object; this list stays as its permanent accessible equivalent.
//
// Dense mono grid, not ten stacked <ul>s: ten groups laid out as columns in
// a five-across grid at desktop, each group a small hairline-topped block of
// chip-styled skills. Scans as a reference table rather than a wall of
// bulleted nouns.
export function Stack() {
  return (
    <section aria-labelledby="stack-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionHeader
          id="stack-heading"
          heading="Technical Stack"
          headingSize="text-40 sm:text-64"
          lede="What I reach for, and what I have actually shipped with."
        />

        <ul
          aria-label="Full technology stack"
          className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5"
        >
          {skillGroups.map((group) => {
            const chips = (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {group.skills.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-[var(--radius)] border border-grid px-2 py-1 font-mono text-12 leading-none text-label"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            )
            return (
              <li key={group.label} className="border-t border-grid pt-4">
                <h3 className="font-mono text-14 text-label">{group.label}</h3>
                {group.draft ? <DraftNote>{chips}</DraftNote> : chips}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
