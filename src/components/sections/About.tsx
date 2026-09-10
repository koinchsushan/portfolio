import { DraftNote } from '@/components/primitives/DraftNote'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { Portrait } from '@/components/about/Portrait'

// DRAFT bio. Every claim below traces to the CV , three years commercial, the
// 450,000-member platform, the 10,000-emails-a-day quotation system, the
// five-engineer team and two-week cycles, the four-into-one chat consolidation,
// the release-train split, the research app, the MSc. Nothing is invented.
// It is prose the owner has not approved, so it stays wrapped in DraftNote.
//
// Rebuilt for Task M. The heading now sits alone, full width, with a normal
// (not oversized) gap below it , the previous heading+portrait row read as
// dead air whenever the portrait was shorter than the heading's own line
// height. The portrait instead opens the body copy itself: a narrow fixed
// column running alongside the first paragraph, top-aligned with it like a
// byline photo beside the start of a printed column, so it reads as part of
// the text rather than a separate floating element. It is never the widest
// column on the page (200px against a ~68ch measure) and never the first
// thing the eye lands on. Below sm the two stack, portrait first.
export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-b border-rule">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionHeader id="about-heading" heading="About" headingSize="text-40 sm:text-64" />

        <DraftNote bordered={false} className="mt-8 sm:mt-10">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[200px_minmax(0,68ch)] sm:gap-10">
            <Portrait className="sm:self-start" />
            <div className="flex flex-col gap-6 text-18 leading-relaxed text-muted">
              <p>
                I build interfaces and the systems underneath them. Three years so far:
                a US healthcare platform serving 450,000 union members, an aerospace
                quotation system reading 10,000 emails a day, and now a five-engineer
                London startup where I scope, build and deploy features myself on
                two-week cycles.
              </p>
              <p>
                The thread through all of it is the same. Taking something fragmented
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
            </div>
          </div>
        </DraftNote>
      </div>
    </section>
  )
}
