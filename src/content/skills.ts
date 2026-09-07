import type { SkillGroup } from './types'

// Transcribed verbatim from the CV's Skills section. These are facts about a
// real person's experience , do not add, remove, or "modernise" an entry.
export const skillGroups: SkillGroup[] = [
  {
    label: 'Languages',
    skills: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL', 'HTML5', 'CSS3'],
  },
  {
    label: 'Frontend',
    skills: [
      'React', 'Next.js', 'Redux', 'Redux-Saga', 'React Query',
      'Context API', 'Angular', 'Chart.js', 'Flutter',
    ],
  },
  {
    label: 'Design Systems & UI',
    skills: [
      'Design tokens', 'Component libraries', 'Material UI', 'Ant Design',
      'Tailwind CSS', 'Styled-components', 'SASS', 'Figma-to-code', 'Responsive design',
    ],
  },
  {
    label: 'Accessibility & Performance',
    skills: [
      'WCAG 2.1 AA', 'Semantic HTML', 'ARIA', 'Core Web Vitals',
      'Code splitting', 'Lazy loading', 'Tree shaking',
    ],
  },
  {
    label: 'Architecture',
    skills: [
      'Micro-frontends', 'Single-SPA', 'Clean Architecture', 'MVVM',
      'Component-driven design', 'SSR/SSG', 'Legacy-system integration', 'Agile/Scrum',
    ],
  },
  {
    label: 'Backend & APIs',
    skills: ['Flask', 'Node.js', 'REST API design', 'GraphQL', 'WebSockets', 'Webhooks', 'Axios'],
  },
  {
    label: 'AI-Assisted Development',
    skills: ['Claude Code', 'GitHub Copilot', 'Codex'],
  },
  {
    label: 'Cloud & Infrastructure',
    skills: ['Firebase', 'Railway', 'Render', 'Docker', 'Stripe'],
  },
  {
    label: 'Testing & CI/CD',
    skills: [
      'Jest', 'Vitest', 'React Testing Library', 'pytest', 'TDD',
      'ESLint', 'Prettier', 'Husky', 'GitLab CI', 'GitHub Actions', 'Git',
    ],
  },
  {
    label: 'Data',
    skills: [
      'Pandas', 'Matplotlib', 'scikit-learn', 'Statistical modelling',
      'SHAP', 'Power BI', 'Data visualisation',
    ],
  },
]
