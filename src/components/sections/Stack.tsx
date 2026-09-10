import { skillGroups } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { StackCanvas } from '@/components/sections/StackCanvas'

// Plain-text mirror of the ten CV skill groupings. This stays a real <ul>
// with a real <li> per entry for two reasons that do not change with the
// presentation: it is the permanent accessible equivalent of the 3D object
// beside it (every reader who cannot or does not use the WebGL layer still
// gets the full list, in document order), and it is the SEO surface search
// engines actually index. All 72 entries stay in the DOM unconditionally,
// nothing here is virtualised, truncated or hidden behind interaction.
//
// Task O: the object and this index now sit side by side in one
// composition, so neither leaves the other a void the way "object, empty
// space, table below" used to. The bordered reference-plate table (cells,
// per-group counts, column rules) is gone; each group is instead a small
// mono label followed by its entries running as continuous, reading-size
// text, the way a book index or a colophon sets a list, not a data grid.
// Nothing here encodes a skill "level", entries are unordered within their
// CV grouping, and every one renders identically regardless of which group
// or column it falls in.
export function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-14 sm:py-20">
        <SectionHeader
          id="stack-heading"
          heading="Technical Stack"
          headingSize="text-40 sm:text-64"
          lede="What I reach for, and what I have actually shipped with."
        />

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-[280px_1fr] sm:items-start">
          <StackCanvas />

          <ul aria-label="Full technology stack" className="columns-1 gap-x-12 md:columns-2">
            {skillGroups.map((group) => {
              const entries = (
                <ul className="mt-1.5 list-none text-16 leading-relaxed text-label">
                  {group.skills.map((skill, i) => (
                    <li key={skill} className="inline">
                      {skill}
                      {i < group.skills.length - 1 && <span aria-hidden>, </span>}
                    </li>
                  ))}
                </ul>
              )
              return (
                <li key={group.label} className="mb-7 break-inside-avoid-column">
                  <h3 className="font-mono text-12 uppercase tracking-[0.14em] text-label/70">{group.label}</h3>
                  {group.draft ? (
                    <DraftNote bordered={false} className="mt-1.5">
                      {entries}
                    </DraftNote>
                  ) : (
                    entries
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
