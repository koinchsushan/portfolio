import { skillGroups } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'
import { Rule } from '@/components/primitives/Rule'
import { SectionHeader } from '@/components/primitives/SectionHeader'

// Plain-text mirror of the ten CV skill groupings. A later task turns this
// into a 3D object; this list stays as its permanent accessible equivalent,
// so the semantics here (one <ul>, one <li> per group, real chip <li>s)
// cannot change shape even though the presentation below does.
//
// Reference plate, not a chip cloud: the ten groups are a real instrument
// spec sheet (languages, frameworks, tooling, ...), so they get a left rail
// of mono group labels over the graticule ground, one row per group, with a
// hairline under every row and a single rule threading the whole plate
// where the rail meets the chips. Nothing here encodes a skill "level" ,
// there is no such data, so every chip renders identically regardless of
// which group it sits in.
export function Stack() {
  return (
    <section aria-labelledby="stack-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-14 sm:py-20">
        <SectionHeader
          id="stack-heading"
          heading="Technical Stack"
          headingSize="text-40 sm:text-64"
          lede="What I reach for, and what I have actually shipped with."
        />

        <div className="graticule mt-10 border border-grid bg-panel">
          <ul aria-label="Full technology stack" className="divide-y divide-grid">
            {skillGroups.map((group) => {
              const chips = (
                <ul className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-[var(--radius)] border border-grid bg-ground px-2 py-1 font-mono text-12 leading-none text-label"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              )
              return (
                <li
                  key={group.label}
                  className="grid grid-cols-1 gap-y-2 px-4 py-3 sm:grid-cols-[128px_1px_1fr] sm:gap-x-6 sm:px-6 sm:py-3.5"
                >
                  <h3 className="font-mono text-14 text-bone">{group.label}</h3>
                  <Rule vertical className="hidden sm:block" />
                  {group.draft ? <DraftNote>{chips}</DraftNote> : chips}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
