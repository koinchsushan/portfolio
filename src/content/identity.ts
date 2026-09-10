import type { Identity } from './types'

// Transcribed verbatim from spec §2 "Identity". Phone number is deliberately
// omitted , the CV carries it, the public site does not.
export const identity: Identity = {
  name: 'Sushan Sunuwar',
  firstName: 'Sushan',
  // The one claim the whole portfolio is evidence for: a 450,000-member
  // benefits platform, 10,000 quote emails a day turned into structured
  // fields, four chat implementations collapsed into one, and three
  // researchers' local scripts turned into an app anyone can open.
  tagline: 'I make complex systems legible.',
  title: 'Software Engineer',
  strapline: 'Product Engineering · AI/ML · Data Science',
  location: 'London, United Kingdom',
  email: 'koinchsushan@gmail.com',
  linkedin: 'linkedin.com/in/sushan-sunuwar',
  github: 'github.com/koinchsushan',
  availability: 'Open to conversations',
}
