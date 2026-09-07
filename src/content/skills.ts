import type { SkillGroup } from './types'

// Spec §2 "Skills" gives only the ten verbatim group labels from the CV, not
// their individual items — the item lists below are assembled solely from
// technology names verified elsewhere in spec §2 (the role stack lines and
// bullets), sorted into their most obvious CV grouping. The grouping itself
// is a best-effort reconstruction, not a transcription, so every group is
// flagged `draft: true` for the owner to check against the CV's actual
// skills section before publishing.
export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    skills: ['TypeScript', 'Python', 'SQL', 'R'],
    draft: true,
  },
  {
    label: 'Frontend',
    skills: ['React', 'Flutter', 'Redux'],
    draft: true,
  },
  {
    label: 'Design Systems & UI',
    skills: ['Material UI', 'Styled-components', 'Ant Design', 'Figma', 'Chart.js'],
    draft: true,
  },
  {
    label: 'Accessibility & Performance',
    skills: ['WCAG 2.1 AA', 'Core Web Vitals'],
    draft: true,
  },
  {
    label: 'Architecture',
    skills: ['Single-SPA', 'Webpack', 'Vite'],
    draft: true,
  },
  {
    label: 'Backend & APIs',
    skills: ['Flask', 'REST APIs', 'jQuery', '.NET MVC'],
    draft: true,
  },
  {
    label: 'AI-Assisted Development',
    skills: ['LangGraph', 'Claude Code'],
    draft: true,
  },
  {
    label: 'Cloud & Infrastructure',
    skills: ['Firebase', 'GitLab CI'],
    draft: true,
  },
  {
    label: 'Testing & CI/CD',
    skills: ['Jest', 'React Testing Library', 'TDD', 'GitLab CI'],
    draft: true,
  },
  {
    label: 'Data',
    skills: ['Pandas', 'Matplotlib', 'SHAP', 'Predictive modelling'],
    draft: true,
  },
]
