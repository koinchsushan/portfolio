import { roles, education, caseStudies } from '@/content'
import { Rule } from '@/components/primitives/Rule'
import { ActionLink } from '@/components/primitives/ActionLink'
import { SectionHeader } from '@/components/primitives/SectionHeader'
import { TrajectoryAxis } from '@/components/graphics/TrajectoryAxis'

// The timeline from `roles` + `education`, kept in each array's own
// CV-given order rather than re-sorted (several roles/education entries
// overlap in date, so a single strict chronology would misrepresent them).
//
// Three of the four roles already have a full case study under Work , this
// section links out to that narrative rather than repeating its bullets
// verbatim, so a headline figure (e.g. "450,000+") appears once on the page
// instead of twice. The one role with no case study (London Metropolitan
// University) keeps its own bullets here, since this is the only place its
// story is told.
//
// Rule-anchored timeline: a mono date rail on the left, a hairline on the
// right of it, content in the remaining space, one row per entry, separated
// by horizontal rules rather than dot markers.
//
// Above that list, `TrajectoryAxis` draws the same dates as a real time
// axis, because the list on its own hides a true fact: the MSc, the London
// Metropolitan University research role and Foundermatcha run across
// genuinely overlapping stretches of time, not one after another.
export function Trajectory() {
  return (
    <section id="trajectory" aria-labelledby="trajectory-heading" className="border-b border-grid">
      <div className="mx-auto max-w-[1400px] px-6 py-16 sm:py-20">
        <SectionHeader id="trajectory-heading" heading="Trajectory" headingSize="text-40 sm:text-64" />

        <TrajectoryAxis roles={roles} education={education} />

        <div className="mt-12">
          <h3 id="trajectory-experience-heading" className="font-mono text-14 text-label">
            Experience
          </h3>
          <ol aria-labelledby="trajectory-experience-heading" className="mt-4 border-t border-grid">
            {roles.map((role) => {
              const caseStudy = caseStudies.find((cs) => cs.employer === role.org)
              return (
                <li
                  key={`${role.org}-${role.dates}`}
                  className="grid grid-cols-1 gap-y-3 border-b border-grid py-6 sm:grid-cols-[112px_1px_1fr] sm:gap-x-8"
                >
                  <p className="font-mono text-12 leading-relaxed text-label">
                    {role.dates}
                    {role.location ? (
                      <>
                        <br />
                        {role.location}
                      </>
                    ) : null}
                  </p>
                  <Rule vertical className="hidden sm:block" />
                  <div>
                    <h4 className="font-subhead text-22 tracking-[-0.01em] text-bone">
                      {role.title} · {role.org}
                    </h4>
                    {role.context && <p className="mt-2 max-w-[60ch] text-16 leading-relaxed text-label">{role.context}</p>}
                    {role.progression && (
                      <p className="mt-2 font-mono text-12 text-label">
                        {role.progression.join(' → ')}
                      </p>
                    )}
                    <p aria-label={`${role.org} technologies`} className="mt-3 font-mono text-12 text-label">
                      {role.stack.join(' · ')}
                    </p>
                    {caseStudy ? (
                      <div className="mt-4">
                        <ActionLink href={`/work/${caseStudy.slug}`} variant="quiet">
                          Read the full case study
                        </ActionLink>
                      </div>
                    ) : (
                      <ul className="mt-4 flex flex-col gap-2">
                        {role.bullets.map((bullet) => (
                          <li key={bullet} className="max-w-[64ch] text-16 leading-relaxed text-label">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-12">
          <h3 id="trajectory-education-heading" className="font-mono text-14 text-label">
            Education
          </h3>
          <ol aria-labelledby="trajectory-education-heading" className="mt-4 border-t border-grid">
            {education.map((ed) => (
              <li
                key={`${ed.institution}-${ed.dates}`}
                className="grid grid-cols-1 gap-y-3 border-b border-grid py-6 sm:grid-cols-[112px_1px_1fr] sm:gap-x-8"
              >
                <p className="font-mono text-12 leading-relaxed text-label">
                  {ed.dates}
                  {ed.location ? (
                    <>
                      <br />
                      {ed.location}
                    </>
                  ) : null}
                </p>
                <Rule vertical className="hidden sm:block" />
                <div>
                  <h4 className="font-subhead text-22 tracking-[-0.01em] text-bone">
                    {ed.award} · {ed.institution}
                  </h4>
                  {ed.project && <p className="mt-2 max-w-[60ch] text-16 leading-relaxed text-label">{ed.project}</p>}
                  {ed.modules && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {ed.modules.map((module) => (
                        <li
                          key={module}
                          className="rounded-[var(--radius)] border border-grid px-2 py-1 font-mono text-12 leading-none text-label"
                        >
                          {module}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
