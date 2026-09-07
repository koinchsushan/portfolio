import { identity, roles, education } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'

// `src/content/` carries no dedicated bio field, so this paragraph is a
// synthesis built only from facts that exist elsewhere in content (identity,
// current role, latest education) — nothing invented. Wrapped in DraftNote
// because it is prose the owner has not approved verbatim, per that
// primitive's contract.
export function About() {
  const currentRole = roles[0]
  const latestEducation = education[0]

  return (
    <section aria-labelledby="about-heading">
      <h2 id="about-heading">About</h2>
      <DraftNote>
        <p>
          {identity.name} is a {identity.title} based in {identity.location}, currently working
          as {currentRole.title} at {currentRole.org}. {identity.strapline}. Studying {latestEducation.award} at{' '}
          {latestEducation.institution}.
        </p>
      </DraftNote>
    </section>
  )
}
