import { DraftNote } from '@/components/primitives/DraftNote'

// DRAFT bio. Every claim below traces to the CV , three years commercial, the
// 450,000-member platform, the 10,000-emails-a-day quotation system, the
// five-engineer team and two-week cycles, the four-into-one chat consolidation,
// the release-train split, the research app, the MSc. Nothing is invented.
// It is prose the owner has not approved, so it stays wrapped in DraftNote.
//
// Editorial offset: the heading sits in a narrow left margin rather than
// above the body, and the prose column starts one grid track further right,
// leaving a visible gap between them instead of a shared left edge.
export function About() {
  return (
    <section aria-labelledby="about-heading" className="border-b border-grid">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-20 sm:py-28 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-3">
          <h2 id="about-heading" className="text-28 tracking-[-0.01em] text-bone sm:text-40 lg:sticky lg:top-24">
            About
          </h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-5">
          <DraftNote>
            <div className="flex flex-col gap-6 text-18 leading-relaxed text-label">
              <p className="max-w-[62ch]">
                I build interfaces and the systems underneath them. Three years so far:
                a US healthcare platform serving 450,000 union members, an aerospace
                quotation system reading 10,000 emails a day, and now a five-engineer
                London startup where I scope, build and deploy features myself on
                two-week cycles.
              </p>
              <p className="max-w-[62ch]">
                The thread through all of it is the same. Taking something fragmented
                and making it legible. Four chat implementations into one component
                layer. A coordinated release train into five independent deployments.
                Three researchers&rsquo; local scripts into an app anyone can open in a
                browser.
              </p>
              <p className="max-w-[62ch]">
                An MSc in Data Analytics sits behind that, which earns its keep on
                data-heavy product surfaces where the interface and the data model
                have to be designed together.
              </p>
            </div>
          </DraftNote>
        </div>
      </div>
    </section>
  )
}
