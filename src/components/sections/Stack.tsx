import { skillGroups } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { StackCanvas } from '@/components/sections/StackCanvas'

// Plain-text mirror of the ten CV skill groupings. A later task turns this
// into a 3D object; this list stays as its permanent accessible equivalent,
// so the semantics here (one <ul>, one <li> per group, real chip <li>s)
// cannot change shape even though the presentation below does. All entries
// stay in the DOM unconditionally , nothing here is virtualised, truncated
// or hidden behind interaction.
//
// Reference plate, not a chip cloud and not a three-column grid: the ten
// groups are a real instrument spec sheet, so each renders as its own
// indexed plate (count, hairline, chip field) and the plates flow through a
// CSS multi-column reader , unequal column heights, a rule between columns ,
// rather than a grid that pins every group to the same row height. Nothing
// here encodes a skill "level": the index is a plate number, the count is
// how many entries CV lists under that heading, and every chip renders
// identically regardless of which group or column it lands in.
export function Stack() {
  const totalSkills = skillGroups.reduce((sum, group) => sum + group.skills.length, 0)

  return (
    <section id="stack" aria-labelledby="stack-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-14 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-[1fr_280px] sm:items-end sm:gap-10">
          <SectionHeader
            id="stack-heading"
            heading="Technical Stack"
            headingSize="text-40 sm:text-64"
            lede="What I reach for, and what I have actually shipped with."
          />
          <StackCanvas className="sm:justify-self-end sm:w-[280px]" />
        </div>

        <div className="mt-10 border border-grid bg-panel">
          <div className="flex items-baseline justify-between gap-4 border-b border-grid px-4 py-3 sm:px-6">
            <span className="font-mono text-12 uppercase tracking-[0.14em] text-label">Reference plate</span>
            <span className="font-mono text-12 text-label">
              {totalSkills} entries / {skillGroups.length} groups
            </span>
          </div>

          <ul
            aria-label="Full technology stack"
            className="columns-1 [column-rule:1px_solid_var(--color-grid)] lg:columns-2"
          >
            {skillGroups.map((group, index) => {
              const chips = (
                <ul className="mt-3 flex flex-wrap gap-1.5">
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
                  className="break-inside-avoid-column border-b border-grid px-4 py-4 sm:px-6 sm:py-5"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-12 text-label">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="font-subhead text-16 text-bone">{group.label}</h3>
                    <span className="ml-auto font-mono text-12 text-label">{group.skills.length}</span>
                  </div>
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
