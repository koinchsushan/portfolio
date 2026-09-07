import type { CaseStudy } from './types'

// Every situation/decision paragraph below is prose built from spec §2's CV
// bullets, plus the verified public context spec §2 records for each
// employer/client (Viveka Health's five product areas, Proponent's scale).
// No metric, date, title or outcome here goes beyond what §2 states. The
// internal quotation product name is never written , only "an ML-powered
// quotation system", per spec §2's binding confidentiality rule.
export const caseStudies: CaseStudy[] = [
  {
    slug: 'foundermatcha',
    index: '01',
    client: 'Foundermatcha',
    employer: 'Foundermatcha',
    role: 'Software Engineer',
    dates: 'Jun 2026 - Current',
    stack: ['React', 'TypeScript', 'Flutter', 'Python/Flask', 'Firebase'],
    situation: [
      'Foundermatcha is an early-stage AI matchmaking startup in London with a live product and roughly 3,000 users. Support ran through email alone, and networking on the platform (invites, connections, group conversations) had no dedicated layer of its own.',
      "Chat had grown surface by surface without a shared foundation: four divergent implementations existed side by side across the product, each maintained separately, while the company also wanted to open matching to a second member type alongside its existing LangGraph-powered conversational AI.",
    ],
    constraint:
      'The four chat implementations were already powering all five live product surfaces, so consolidating them had to happen underneath a shipping product on two-week cycles rather than as a parallel rewrite.',
    decision: [
      'The four chat implementations were consolidated into a single shared component layer that now powers all five product surfaces, followed by an app-wide design-system pass to a Figma spec unifying tokens and the CTA system across the product.',
      "Separately, a dedicated networking layer (shareable invite codes, email invites that auto-connect at signup, and group chats) was built with its own group data model so networking activity stayed out of the matching pool, doubling connections made on the platform. Real-time in-app chat, built from scratch, replaced email-only support inside the same React/TypeScript admin panel staff already used.",
    ],
    outcomes: [
      { value: '2×', label: 'connections made on the platform' },
      { value: '~3,000', label: 'users on the live product' },
      { value: '4 → 1', label: 'chat implementations consolidated into one shared layer, across 5 surfaces' },
    ],
    links: [
      { label: 'foundermatcha.com', href: 'https://foundermatcha.com/' },
      { label: 'App Store', href: 'https://apps.apple.com/gb/app/foundermatcha/id6502861320' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.foundermatcha.fm' },
    ],
    diagram: 'converge',
  },
  {
    slug: 'viveka-health',
    index: '02',
    client: 'Viveka Health',
    employer: 'Viveka Services',
    role: 'Frontend Software Engineer',
    dates: 'Jul 2024 - Mar 2025',
    stack: ['TypeScript', 'Single-SPA', 'Redux', 'Git'],
    situation: [
      'Viveka Health sells AI-powered union benefits administration to labor union fund administrators, across five product areas: Mobile App & Customer Experience, Eligibility & Enrollment Management, Claims Administration & Payments, Remittance Reporting & Processing, and Fraud & Transparency. The platform served 450,000+ union members.',
      'Every squad shipped through one coordinated release train, and a shared UI layer that predated the platform\'s growth left global and async state across eligibility processing, contract configuration and employee data management prone to cross-module inconsistencies that surfaced stale records to users.',
    ],
    constraint:
      "The platform's five product areas shipped through one coordinated release train, so any squad's change had to be coordinated and re-tested against all five before every deploy.",
    decision: [
      'Micro-frontend modules were shipped with Single-SPA, splitting the single release train into independent per-squad deployments mapped onto the platform\'s own product boundaries: Mobile App & Customer Experience, Eligibility & Enrollment, Claims Administration & Payments, Remittance Reporting & Processing, and Fraud & Transparency.',
      'A shared React component library (Material UI, Styled-components) built to WCAG 2.1 AA gave every squad one accessible, Figma-accurate source of UI truth, while global and async state across eligibility processing, contract configuration and employee data management was re-architected to resolve the cross-module inconsistencies that had been surfacing stale records.',
      'Route-level code splitting, lazy loading and tree shaking across the Webpack and Vite build cut bundle size by roughly 30% and lifted Core Web Vitals on the highest-traffic workflows. The frontend GitLab CI pipeline was owned end to end, with Jest and React Testing Library coverage driven under TDD and PRs reviewed for architecture, consistency and accessibility regressions.',
    ],
    outcomes: [
      { value: '450,000+', label: 'union members served by the platform' },
      { value: '~30%', label: 'bundle size reduction on the highest-traffic workflows' },
      { value: '5', label: 'independently-deploying module lanes replacing one release train' },
    ],
    links: [{ label: 'vivekahealth.com', href: 'https://www.vivekahealth.com/' }],
    diagram: 'split',
  },
  {
    slug: 'proponent',
    index: '03',
    client: 'Proponent',
    employer: 'Javra Software',
    role: 'Frontend Software Engineer',
    dates: 'Mar 2022 - Jun 2024',
    stack: ['React', 'TypeScript', 'Chart.js', 'Ant Design'],
    situation: [
      "Proponent is the world's largest independent, employee-owned aerospace parts distributor: roughly $114M revenue, 600+ staff, and 12 facilities across 8 countries serving MRO, OEM and commercial airline markets. Its operations team processed 10,000+ emails a day by hand to generate quotes, a fragmented manual process that increasingly needed additional headcount just to keep pace with volume.",
      'Javra Software, working remotely from the Netherlands as engineering partner, was building the React and TypeScript frontend for an ML-powered quotation system meant to turn that email stream into structured data, alongside interactive Chart.js dashboards for client stakeholders and an Ant Design component library shared across multiple client products by a 4-6 engineer team.',
    ],
    constraint:
      "The 10,000+ daily emails arrived as unstructured free text, so a quote could only reach the operations team's process once that text had been reliably converted into structured fields.",
    decision: [
      'The React and TypeScript frontend for the ML-powered quotation system turned that unstructured email stream into structured quote fields, replacing the fragmented manual process and letting the operations team handle quote volume that had previously required additional headcount.',
      'Interactive Chart.js dashboards gave client stakeholders visibility into the data, and a shared Ant Design component library, adopted across multiple client products by the 4-6 engineer team, cut per-feature build time by 20-30%. React components were embedded directly into live jQuery and .NET MVC systems, enabling incremental modernisation without a rewrite or service interruption, while state management and responsive UI stayed consistent across 3+ concurrent client products.',
    ],
    outcomes: [
      { value: '10,000+', label: 'emails processed per day by the quotation system' },
      { value: '20-30%', label: 'per-feature build time cut via the shared Ant Design component library' },
      { value: '3+', label: 'concurrent client products kept consistent in state and UI' },
    ],
    links: [
      { label: 'proponent.com', href: 'https://www.proponent.com/' },
      { label: 'javra.com', href: 'https://javra.com/' },
    ],
    diagram: 'extract',
  },
]

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((cs) => cs.slug === slug)
}
