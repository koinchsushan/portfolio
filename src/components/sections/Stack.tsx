import { skillGroups } from '@/content'
import { DraftNote } from '@/components/primitives/DraftNote'

// Plain-text mirror of the ten CV skill groupings. A later task turns this
// into a 3D object; this list stays as its permanent accessible equivalent.
export function Stack() {
  return (
    <section aria-labelledby="stack-heading">
      <h2 id="stack-heading">Technical Stack</h2>
      <ul aria-label="Full technology stack">
        {skillGroups.map((group) => {
          const list = (
            <ul>
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          )
          return (
            <li key={group.label}>
              <h3>{group.label}</h3>
              {group.draft ? <DraftNote>{list}</DraftNote> : list}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
