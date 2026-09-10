import { SectionHeader } from '@/components/primitives/SectionHeader'
import { Portrait } from '@/components/about/Portrait'
import { bio } from '@/content'

// The bio itself lives in `@/content/bio`, like every other fact on the site.
// This file is layout only.
//
// Rebuilt after the owner said the section read as centred and apart from the
// rest of the page. Measurement backed him up. Rendered at 1440 and measured
// by text ink rather than by box, the old About left 401px of empty space on
// its right edge, against 25px to 67px for Work, Research, Stack and
// Trajectory. Two causes: the row was `sm:w-max sm:mx-auto`, which
// shrink-wrapped the block and centred it inside a 1400px container every
// other section starts hard against, and a 240px portrait beside a 68ch
// column simply does not span a wide viewport.
//
// The fix copies what already works here. Trajectory fills its width by
// keeping prose at a readable measure while letting a structural element run
// the full column. So: the paragraphs stay capped at 66ch, and the pull line
// runs the full width of the narrative column. The portrait takes a real
// column at 380px (400px at xl, the most the 800px source covers at 2x)
// instead of sitting inside the text column, and sticks while the narrative
// scrolls past it. Sticky is CSS, no JS, so it costs nothing on any
// capability tier and cannot fail on a hidden tab.
//
// Every grid child is placed explicitly, and that is load-bearing rather
// than tidiness. The first build of this let the pull line span both
// columns on an auto-placed grid, and a sticky item's travel turned out to
// be bounded by the grid container rather than by its own row: the portrait
// slid down over the pull line and hid its first 400px, permanently, from
// the moment the band entered view. Measured at 1440, overlapX sat at 400px
// (the portrait's full width) for every scroll step to the end of the
// section. Keeping the pull line in column 2 puts it somewhere column 1 can
// never reach, whatever sticky does.
//
// One `--signal` rule, on the pull line, the only accent in the section. The
// five paragraphs are the evidence and that line is the claim, so it is the
// one place the section raises its voice.
export function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:py-28">
        <SectionHeader id="about-heading" heading="About" headingSize="text-40 sm:text-64" />

        <div className="mt-10 grid grid-cols-1 gap-10 sm:mt-14 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-x-20 xl:grid-cols-[400px_minmax(0,1fr)] xl:gap-x-24">
          <Portrait className="lg:sticky lg:top-24 lg:col-start-1 lg:row-start-1 lg:self-start" />

          <div className="flex max-w-[66ch] flex-col gap-6 text-18 leading-relaxed text-label lg:col-start-2 lg:row-start-1">
            {bio.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <p
            data-testid="about-pull"
            className="border-l-2 border-signal pl-6 font-display text-28 leading-[1.15] tracking-[-0.02em] text-bone sm:pl-8 sm:text-40 lg:col-start-2 lg:row-start-2 lg:mt-2"
          >
            {bio.pull}
          </p>
        </div>
      </div>
    </section>
  )
}
