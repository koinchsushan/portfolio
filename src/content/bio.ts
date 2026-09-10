import type { Bio } from './types'

// The About narrative. Owner-authored in substance: every role, industry,
// date and figure below traces to the CV and to the owner's own account of
// his career, given in session on 2026-09-10.
//
// Three sentences here are interpretation rather than transcription, and the
// owner approved them as his own voice, not as CV facts:
//   1. "where I first saw what badly structured information costs..."
//   2. "When your code produces the findings, correctness stops being a
//      code-review concern."
//   3. The closing pull line.
// Everything else is a compression of `roles.ts` and `education.ts`.
//
// Shape, not decoration: the paragraphs run in career order because the
// story IS a sequence, one industry handing off to the next. The pull line
// is last because the five beats have to earn it. It deliberately does not
// restate `identity.tagline`, which the hero already says.
export const bio: Bio = {
  paragraphs: [
    'My first job was as a data entry operator for the Government of Nepal. Six months in 2020, moving records out of one form and into another. It is a footnote on my CV. It is also where I first saw what badly structured information costs the person at the other end of it.',
    'Two years later I was writing the frontend for an aerospace parts distributor, on a client account run out of the Netherlands. Aerospace has no tolerance for approximate work. The system read more than 10,000 supplier emails a day and turned them into structured quote data, taking a manual process and making it something the operations team could absorb without adding headcount.',
    'Then healthcare, and a US benefits platform serving 450,000 union members. New industry, same shape of problem, higher stakes. I rebuilt global and async state across eligibility and enrolment so that stale records stopped reaching the people who depended on them being right.',
    'Alongside the job I took an MSc in Data Analytics and finished with a Distinction, then put it to work as lead developer on a behavioural study at London Metropolitan University. Three researchers had three separate Python scripts. They now have one application, covering 845 trials from 228 participants, and a paper I am co-authoring. When your code produces the findings, correctness stops being a code-review concern.',
    'Now I am at Foundermatcha, an early-stage AI matchmaking startup in London: five engineers, two-week cycles, and very little distance between writing something and watching people use it. Lately that has meant collapsing four separate chat implementations into one shared component layer, and building transactional email infrastructure from scratch.',
  ],
  pull: 'I have never worked in the same industry twice. The problem has been the same every time.',
}
