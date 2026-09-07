/**
 * Face assignments for the interactive stack object (Task G). Separate from
 * the `content` barrel on purpose: this file is imported only from inside
 * the lazily-loaded 3D component (`components/three/StackObject.tsx`) and
 * the static-tier SVG, never from `@/content`, so nothing here can leak into
 * the eagerly-rendered page bundle.
 *
 * Every `context` line is a paraphrase of prose or a `stack`/`context` field
 * that already exists in `src/content/caseStudies.ts` or `src/content/roles.ts`
 * , see task-G-report.md for the exact source sentence behind each one. No
 * fact here goes beyond what those files state, and entries with no genuine
 * supporting sentence carry no `context` at all: the face then shows the bare
 * name, per the brief ("do not invent usage").
 *
 * `icon` is a named export key from the `simple-icons` package (e.g.
 * `'siReact'`), resolved to real brand path data only inside the 3D
 * component. Entries with no Simple Icons entry (`icon` omitted) render as a
 * text wordmark instead, never a hand-drawn approximation of a mark that
 * does not exist.
 *
 * `skill` must match an entry string in `src/content/skills.ts` verbatim ,
 * a test asserts every face name resolves there, so this list can never
 * drift into inventing a technology the CV does not list.
 */
export interface StackFace {
  /** Verbatim entry from `skillGroups` in `src/content/skills.ts`. */
  skill: string
  /** Display name on the face when it differs from `skill` (e.g. the
   * underlying product behind a compound skill entry like "Figma-to-code"). */
  label?: string
  /** `simple-icons` named export, e.g. `'siReact'`. Omit for a wordmark face. */
  icon?: string
  /** One line of real context, or omitted where none is supported. */
  context?: string
}

export const stackFaces: StackFace[] = [
  // -- Faces with real usage context, drawn from caseStudies.ts / roles.ts --
  { skill: 'TypeScript', icon: 'siTypescript', context: 'Primary language across Foundermatcha, Viveka Health and Proponent.' },
  { skill: 'Python', icon: 'siPython', context: 'Backend language at Foundermatcha and the London Metropolitan University research tool.' },
  { skill: 'React', icon: 'siReact', context: 'Frontend framework across Foundermatcha, Viveka Health and Proponent.' },
  { skill: 'Redux', icon: 'siRedux', context: 'State management on the Viveka Health platform, serving 450,000+ union members.' },
  { skill: 'Chart.js', icon: 'siChartdotjs', context: 'Client dashboards at Proponent, also used in the London Metropolitan University research tool.' },
  { skill: 'Flutter', icon: 'siFlutter', context: "Foundermatcha's mobile app, alongside its React admin panel." },
  { skill: 'Material UI', icon: 'siMui', context: 'Shared component library at Viveka Health, built to WCAG 2.1 AA.' },
  { skill: 'Ant Design', icon: 'siAntdesign', context: 'Shared component library at Proponent, cut per-feature build time 20 to 30%.' },
  { skill: 'Styled-components', icon: 'siStyledcomponents', context: "Styling layer for Viveka Health's shared component library." },
  { skill: 'Figma-to-code', label: 'Figma', icon: 'siFigma', context: 'Design-system source of truth at Foundermatcha and Viveka Health.' },
  { skill: 'Single-SPA', context: 'Micro-frontend isolation across squads at Viveka Health.' },
  { skill: 'Flask', icon: 'siFlask', context: 'Backend framework at Foundermatcha and the London Metropolitan University research tool.' },
  { skill: 'Claude Code', icon: 'siClaudecode', context: 'Used throughout delivery at Foundermatcha.' },
  { skill: 'Firebase', icon: 'siFirebase', context: 'Backend infrastructure on the Foundermatcha stack.' },
  { skill: 'Jest', icon: 'siJest', context: 'Test coverage at Viveka Health, driven under TDD.' },
  { skill: 'React Testing Library', icon: 'siTestinglibrary', context: "Paired with Jest for Viveka Health's test coverage under TDD." },
  { skill: 'GitLab CI', icon: 'siGitlab', context: 'Frontend pipeline owned end to end at Viveka Health.' },
  { skill: 'Git', icon: 'siGit', context: 'Version control on the Viveka Health engagement.' },
  { skill: 'Pandas', icon: 'siPandas', context: 'Data processing for the London Metropolitan University research tool.' },
  { skill: 'Matplotlib', context: 'Visualisation for the London Metropolitan University research tool.' },

  // -- Genuine products with no supporting sentence in case studies/roles:
  // name alone, no invented usage. --
  { skill: 'JavaScript (ES6+)', icon: 'siJavascript' },
  { skill: 'Next.js', icon: 'siNextdotjs' },
  { skill: 'Angular', icon: 'siAngular' },
  { skill: 'Tailwind CSS', icon: 'siTailwindcss' },
  { skill: 'Node.js', icon: 'siNodedotjs' },
  { skill: 'GraphQL', icon: 'siGraphql' },
  { skill: 'Docker', icon: 'siDocker' },
  { skill: 'Stripe', icon: 'siStripe' },
  { skill: 'Vitest', icon: 'siVitest' },
  { skill: 'ESLint', icon: 'siEslint' },
  { skill: 'GitHub Actions', icon: 'siGithubactions' },
  { skill: 'scikit-learn', icon: 'siScikitlearn' },
]
