import type { Role } from './types'

// Transcribed from spec §2 "Roles", newest first, exactly as CV-ordered
// there. The London Metropolitan University research role is listed last,
// as in the CV, even though its dates overlap with Foundermatcha's.
export const roles: Role[] = [
  {
    org: 'Foundermatcha',
    location: 'London, United Kingdom',
    title: 'Software Engineer',
    dates: 'Jun 2026 – Current',
    stack: ['React', 'TypeScript', 'Flutter', 'Python/Flask', 'Firebase'],
    context: 'Early-stage AI matchmaking startup, live product, ~3,000 users.',
    bullets: [
      'Doubled connections made on the platform by designing the networking layer: shareable invite codes, email invites that auto-connect at signup, group chats. Kept networking out of the matching pool with a dedicated group data model.',
      'Replaced email-only support with real-time in-app chat built from scratch; extended the React/TS admin panel so staff answer users in one place.',
      'Opened the product to a second user type via a lightweight member role across the React admin panel and Flutter app, including onboarding conversation and concierge persona inside the existing LangGraph conversational AI.',
      'Consolidated four divergent chat implementations into one shared component layer now powering all five product surfaces; followed with an app-wide design-system pass to a Figma spec, unifying tokens and a single CTA system.',
      'Built transactional email infrastructure from scratch: provider-agnostic transport with a test double, plus a signature-verified bounce webhook maintaining a suppression list.',
      'Two-week cycles in a five-engineer team; scoped with the lead engineer, deployed to production himself, used Claude Code throughout.',
    ],
  },
  {
    org: 'Viveka Services',
    location: 'Remote',
    title: 'Frontend Software Engineer',
    dates: 'Jul 2024 – Mar 2025',
    stack: ['TypeScript', 'Single-SPA', 'Redux', 'Git'],
    context:
      'US healthcare client (product: Viveka Health) — sells AI-powered union benefits administration to labor union fund administrators, across five product areas: Mobile App & Customer Experience, Eligibility & Enrollment Management, Claims Administration & Payments, Remittance Reporting & Processing, and Fraud & Transparency.',
    bullets: [
      'Shipped micro-frontend modules with Single-SPA on a platform serving 450,000+ union members, replacing a coordinated release train with independent per-squad deployments.',
      "Built the platform's shared React component library (Material UI, Styled-components) to WCAG 2.1 AA — one accessible, Figma-accurate source of UI truth across squads.",
      'Re-architected global and async state across eligibility processing, contract configuration and employee data management, resolving cross-module data inconsistencies that surfaced stale records to users.',
      'Cut bundle size ~30% and lifted Core Web Vitals on the highest-traffic workflows via route-level code splitting, lazy loading and tree shaking across the Webpack and Vite build.',
      'Owned the frontend GitLab CI pipeline end to end.',
      'Drove Jest and React Testing Library coverage under TDD; reviewed PRs for architecture, consistency and accessibility regressions.',
    ],
  },
  {
    org: 'Javra Software',
    location: 'Remote, Netherlands (HQ Culemborg)',
    title: 'Frontend Software Engineer',
    dates: 'Mar 2022 – Jun 2024',
    stack: ['React', 'TypeScript', 'Chart.js', 'Ant Design'],
    progression: ['Intern', 'Junior Developer', 'Frontend Developer'],
    context:
      "Client: Proponent — the world's largest independent, employee-owned aerospace parts distributor (~$114M revenue, 600+ staff, 12 facilities across 8 countries, serving MRO, OEM and commercial airline markets).",
    bullets: [
      'Built the React and TypeScript frontend for an ML-powered quotation system extracting structured data from 10,000+ emails per day, replacing a fragmented manual process and enabling the operations team to handle quote volume that previously required additional headcount.',
      'Designed interactive Chart.js data-visualisation dashboards used by client stakeholders.',
      'Built and maintained an Ant Design component library adopted across multiple client products by a 4–6 engineer team, cutting per-feature build time by 20–30%.',
      'Embedded React components into live jQuery and .NET MVC systems, enabling incremental modernisation without a rewrite or service interruption.',
      'Kept state management and responsive UI consistent across 3+ concurrent client products.',
    ],
  },
  {
    org: 'London Metropolitan University',
    title: 'Lead Developer & Co-Author',
    dates: 'Sep 2025 – Current',
    stack: ['Python', 'Flask', 'Chart.js', 'Pandas', 'Matplotlib'],
    context: 'Faculty-led behavioural research study.',
    bullets: [
      "Turned three researchers' separate local Python scripts into one live web application covering 845 trials from 228 participants.",
      'Self-service dataset upload — validated, atomically written, revertible in one click — backed by a 21-test suite.',
      'Interactive visualisation layer: animated trial replay, spatial heatmaps, learning curves, error-pattern breakdowns across eight analyses, unified by a tokenised design system with full dark mode.',
      'Published open-source under MIT with a contributor guide and documented releases; forked by three collaborators. Co-authoring the resulting paper on the blank-card hint effect.',
    ],
  },
]
