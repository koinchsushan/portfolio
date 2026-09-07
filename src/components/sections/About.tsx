import { DraftNote } from '@/components/primitives/DraftNote'

// DRAFT bio. Every claim below traces to the CV — three years commercial, the
// 450,000-member platform, the 10,000-emails-a-day quotation system, the
// five-engineer team and two-week cycles, the four-into-one chat consolidation,
// the release-train split, the research app, the MSc. Nothing is invented.
// It is prose the owner has not approved, so it stays wrapped in DraftNote.
export function About() {
  return (
    <section aria-labelledby="about-heading">
      <h2 id="about-heading">About</h2>
      <DraftNote>
        <p>
          I build interfaces and the systems underneath them. Three years so far:
          a US healthcare platform serving 450,000 union members, an aerospace
          quotation system reading 10,000 emails a day, and now a five-engineer
          London startup where I scope, build and deploy features myself on
          two-week cycles.
        </p>
        <p>
          The thread through all of it is the same — taking something fragmented
          and making it legible. Four chat implementations into one component
          layer. A coordinated release train into five independent deployments.
          Three researchers&rsquo; local scripts into an app anyone can open in a
          browser.
        </p>
        <p>
          An MSc in Data Analytics sits behind that, which earns its keep on
          data-heavy product surfaces where the interface and the data model
          have to be designed together.
        </p>
      </DraftNote>
    </section>
  )
}
