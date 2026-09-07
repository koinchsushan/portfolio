import Link from 'next/link'
import { roles, education, caseStudies } from '@/content'

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
export function Trajectory() {
  return (
    <section id="trajectory" aria-labelledby="trajectory-heading">
      <h2 id="trajectory-heading">Trajectory</h2>

      <div>
        <h3 id="trajectory-experience-heading">Experience</h3>
        <ol aria-labelledby="trajectory-experience-heading">
          {roles.map((role) => {
            const caseStudy = caseStudies.find((cs) => cs.employer === role.org)
            return (
              <li key={`${role.org}-${role.dates}`}>
                <h4>
                  {role.title} · {role.org}
                </h4>
                <p>
                  {role.dates}
                  {role.location ? ` · ${role.location}` : ''}
                </p>
                {role.context && <p>{role.context}</p>}
                {role.progression && <p>Progression: {role.progression.join(' → ')}</p>}
                <ul aria-label={`${role.org} technologies`}>
                  {role.stack.map((tech) => (
                    <li key={tech}>{tech}</li>
                  ))}
                </ul>
                {caseStudy ? (
                  <p>
                    <Link href={`/work/${caseStudy.slug}`}>Read the full case study</Link>
                  </p>
                ) : (
                  <ul>
                    {role.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div>
        <h3 id="trajectory-education-heading">Education</h3>
        <ol aria-labelledby="trajectory-education-heading">
          {education.map((ed) => (
            <li key={`${ed.institution}-${ed.dates}`}>
              <h4>
                {ed.award} · {ed.institution}
              </h4>
              <p>
                {ed.dates}
                {ed.location ? ` · ${ed.location}` : ''}
              </p>
              {ed.project && <p>{ed.project}</p>}
              {ed.modules && (
                <ul>
                  {ed.modules.map((module) => (
                    <li key={module}>{module}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
