# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Sushan Sunuwar's personal portfolio — a statically generated Next.js site whose own craft substitutes for the client screenshots his enterprise work cannot show.

**Architecture:** All CV facts live in one typed content module that the entire site renders from, guarded by tests that fail the build if a confidentiality rule is broken. The UI is a token-driven design system. Three WebGL/scroll "signature moments" are layered last, each dynamically imported, capability-gated, and shipped with a static fallback that is a designed composition rather than an absence.

**Tech Stack:** Next.js 15 (App Router, default output — see note), React 19, TypeScript (strict), Tailwind v4, React Three Fiber + drei + raw GLSL, GSAP/ScrollTrigger, Lenis, Zod, Resend, Vitest + React Testing Library, Playwright + axe.

**Spec:** `docs/superpowers/specs/2026-09-07-portfolio-design.md` — read it before Task 1. The plan argues from the spec; both travel together.

## Global Constraints

Every task's requirements implicitly include this section. Values are verbatim from the spec §2.

- **Output mode:** default Next output on Vercel — **not** `output: 'export'`. Every
  page is statically prerendered at build time, and `/api/contact` is the single
  serverless route handler. `output: 'export'` would break that route, so it must
  never be set. Spec §9's "fully static" means prerendered pages, not a static export.
- **Node 24, npm 11.** No pnpm/yarn.
- **TypeScript `strict: true`.** No `any` in committed code.
- **Confidentiality — binding.** The internal quotation product name must never appear in copy, code, comments, commit messages, alt text, or filenames. Do not reference Javra's "OrderAI". Do not link Javra's Proponent case study (it 404s). Proponent, Javra Software, Viveka Health, Foundermatcha may all be named.
- **No phone number** anywhere in the repo or built output. Contact is email + LinkedIn + form.
- **No invented facts.** Every metric, date, title and outcome traces to the CV. Anything requiring the owner's knowledge is marked `DRAFT — owner to rewrite`.
- **Foundermatcha figures:** use ~3,000 users. Never the company's 20,000-by-2027 target or its university partnerships.
- **No borrowed client imagery.** Client logos permitted, monochrome `steel` only.
- **Colour:** `--ember` at most once per viewport. Never `#FFFFFF` — use `--bone`.
- **Motion:** every signature moment ships a static composition for `prefers-reduced-motion: reduce`.
- **Budgets:** initial JS ≤ 120kb gz excluding deferred 3D. LCP ≤ 1.8s on 4G. CLS ≤ 0.02. Lighthouse 95+ mobile / 90+ desktop.
- **Fonts:** Uncut Sans + Commit Mono, self-hosted via `next/font/local`. Never Space Grotesk + Inter.

---

# STAGE 1 — SKELETON

Deliverable: every route, every real word, semantic HTML, zero motion, zero colour system. Owner checkpoint: *are the words right?*

---

### Task 1: Scaffold + confidentiality guard

The guard test is the deliverable; the scaffold exists to run it. Written first so no later task can violate the rules unnoticed.

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `tests/guards/confidentiality.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` runs Vitest across `tests/` and `src/`. `npm run build` produces a static site.

- [ ] **Step 1: Scaffold**

```bash
cd /Users/sushansunuwar/Developer/portfolio
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --no-turbopack --import-alias "@/*"
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event globby
```

- [ ] **Step 2: Configure Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

`tests/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write the failing guard test**

Forbidden terms are stored as SHA-256 hashes so the plaintext never enters this public repository. That is the whole point of the file — do not "simplify" it by inlining the strings.

`tests/guards/confidentiality.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { globby } from 'globby'

// SHA-256 of lowercased forbidden tokens. Plaintext is deliberately absent:
// writing these terms here would publish exactly what the rule forbids.
// See docs/superpowers/specs/2026-09-07-portfolio-design.md §2.
const FORBIDDEN_TOKEN_HASHES = new Set([
  '869c1c6bf93ae05021205c3e8fbe60bcd289bee7e14b3f9125d2f1591f6597b6', // internal quotation product name
  '24ad408bb1c34e98cd6f8f5f62e81eb40cdd567c6e872a127bf44087da8cc943', // unrelated employer product
  '98c2604fe338cb54b178220b3dae4c8f20cb26e75088a506b0bed015b92e5017', // personal phone, national format
  'd8a838a0f59663e88f081743aafd04997340910a5da705fe0ae64858e16ce4fb', // personal phone, E.164
])

const sha = (s: string) => createHash('sha256').update(s).digest('hex')

/** Lowercase alphanumeric runs, plus digit-only runs with separators stripped. */
function tokenize(text: string): string[] {
  const lower = text.toLowerCase()
  const words = lower.match(/[a-z0-9+]+/g) ?? []
  const digitRuns = lower.replace(/[\s\-().]/g, '').match(/\+?\d{7,}/g) ?? []
  return [...words, ...digitRuns]
}

async function projectTextFiles(): Promise<string[]> {
  return globby(['**/*.{ts,tsx,js,jsx,css,md,json,html,svg,txt}'], {
    gitignore: true,
    ignore: ['tests/guards/confidentiality.test.ts', 'package-lock.json', 'docs/**'],
  })
}

describe('confidentiality guard', () => {
  it('finds no forbidden token in any project file', async () => {
    const files = await projectTextFiles()
    expect(files.length).toBeGreaterThan(0)

    const violations: string[] = []
    for (const file of files) {
      const text = await readFile(file, 'utf8')
      for (const token of tokenize(text)) {
        if (FORBIDDEN_TOKEN_HASHES.has(sha(token))) {
          violations.push(`${file}: forbidden token (hash ${sha(token).slice(0, 8)})`)
        }
      }
    }
    expect(violations).toEqual([])
  })

  it('tokenizes and matches, proven with a sentinel', () => {
    // Proves the tokenize -> hash -> lookup path really fires, using a nonsense
    // sentinel. Never encode a real forbidden term here in any form: a reversible
    // encoding in a public repo defeats the guard entirely.
    const sentinel = 'zzqqxsentinel42'
    const localSet = new Set([sha(sentinel)])
    const tokens = tokenize(`some prose containing ${sentinel} inline.`)
    expect(tokens.some((t) => localSet.has(sha(t)))).toBe(true)
  })

  it('does not match on innocuous prose', () => {
    const localSet = new Set([sha('zzqqxsentinel42')])
    expect(tokenize('React TypeScript Proponent Javra').some((t) => localSet.has(sha(t)))).toBe(false)
  })
})
```

- [ ] **Step 4: Run it**

Run: `npm test -- tests/guards/confidentiality.test.ts`
Expected: PASS, both tests. If the first fails, a forbidden term is already in the repo — remove it before continuing.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
Scaffold Next.js app with confidentiality guard

Forbidden terms are matched by SHA-256 so the plaintext never enters
this repository. The guard runs on every test invocation.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Content module

Single source of truth. Every later task renders from here and never hardcodes a fact.

**Files:**
- Create: `src/content/identity.ts`, `roles.ts`, `caseStudies.ts`, `research.ts`, `education.ts`, `skills.ts`, `types.ts`, `index.ts`
- Test: `tests/content/integrity.test.ts`

**Interfaces:**
- Consumes: Task 1's test setup.
- Produces:
  - `identity: Identity` — `{ name, title, strapline, location, email, linkedin, github, availability }`
  - `caseStudies: CaseStudy[]` — each `{ slug, index, client, employer, role, dates, stack: string[], situation: string[], constraint: string, decision: string[], outcomes: Metric[], links: Link[], diagram: DiagramId }`
  - `research: ResearchItem[]`, `roles: Role[]`, `education: Education[]`, `skillGroups: SkillGroup[]`
  - `type Metric = { value: string; label: string }`
  - `type DiagramId = 'converge' | 'split' | 'extract'`
  - `getCaseStudy(slug: string): CaseStudy | undefined`

- [ ] **Step 1: Write the failing integrity test**

`tests/content/integrity.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { identity, caseStudies, research, roles, education, skillGroups, getCaseStudy } from '@/content'

describe('identity', () => {
  it('carries the CV identity verbatim', () => {
    expect(identity.name).toBe('Sushan Sunuwar')
    expect(identity.title).toBe('Frontend Software Engineer')
    expect(identity.location).toBe('London, United Kingdom')
    expect(identity.email).toBe('koinchsushan@gmail.com')
    expect(identity.availability).toBe('Open to conversations')
  })

  it('exposes no phone field at all', () => {
    expect(Object.keys(identity)).not.toContain('phone')
  })
})

describe('case studies', () => {
  it('has exactly the three approved studies in order', () => {
    expect(caseStudies.map((c) => c.slug)).toEqual([
      'foundermatcha', 'viveka-health', 'proponent',
    ])
  })

  it('numbers them 01..03', () => {
    expect(caseStudies.map((c) => c.index)).toEqual(['01', '02', '03'])
  })

  it('gives every study the full narrative shape', () => {
    for (const cs of caseStudies) {
      expect(cs.situation.length).toBeGreaterThanOrEqual(2)
      expect(cs.constraint.length).toBeGreaterThan(20)
      expect(cs.decision.length).toBeGreaterThanOrEqual(1)
      expect(cs.outcomes.length).toBeGreaterThanOrEqual(2)
      expect(cs.stack.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('uses only the three defined diagram ids', () => {
    for (const cs of caseStudies) {
      expect(['converge', 'split', 'extract']).toContain(cs.diagram)
    }
  })

  it('resolves by slug', () => {
    expect(getCaseStudy('proponent')?.client).toBe('Proponent')
    expect(getCaseStudy('nope')).toBeUndefined()
  })
})

describe('CV metrics are exact', () => {
  const all = JSON.stringify(caseStudies)
  it('uses the verified figures', () => {
    expect(all).toContain('450,000+')
    expect(all).toContain('10,000+')
    expect(all).toContain('~3,000')
  })

  it('never claims the employer forward-looking targets', () => {
    expect(all).not.toContain('20,000')
    expect(all).not.toMatch(/Oxford|Cambridge|Imperial/)
  })
})

describe('research', () => {
  it('lists three studies and never says "dissertation"', () => {
    expect(research).toHaveLength(3)
    expect(JSON.stringify(research.map((r) => r.title))).not.toMatch(/dissertation/i)
  })

  it('records the CardsProblemAnalysis facts', () => {
    const cards = research.find((r) => r.repo.endsWith('CardsProblemAnalysis'))!
    expect(cards.licence).toBe('MIT')
    expect(cards.forks).toBe(3)
    expect(cards.blurb).toContain('845')
    expect(cards.blurb).toContain('228')
  })
})

describe('roles and education', () => {
  it('has four roles newest first', () => {
    expect(roles.map((r) => r.org)).toEqual([
      'Foundermatcha', 'Viveka Services', 'Javra Software', 'London Metropolitan University',
    ])
  })

  it('records the MSc distinction', () => {
    expect(education[0].award).toContain('Distinction')
  })
})

describe('skills', () => {
  it('keeps the ten CV groupings', () => {
    expect(skillGroups).toHaveLength(10)
    expect(skillGroups[0].label).toBe('Languages')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm test -- tests/content/integrity.test.ts`
Expected: FAIL — `Cannot find module '@/content'`.

- [ ] **Step 3: Write the content module**

Transcribe from spec §2 exactly. `src/content/types.ts` declares the interfaces named in **Interfaces** above. `src/content/index.ts` re-exports everything plus `getCaseStudy`.

Copy rules while writing:
- Situation paragraphs may use the verified public context in spec §2 (Viveka's five product areas; Proponent's scale) to sharpen the story. Nothing beyond that.
- Constraint is one sentence naming what made the obvious solution unavailable.
- The internal product name is never written. Say "an ML-powered quotation system".
- Any sentence needing the owner's knowledge gets a `draft: true` flag on the field's object so Task 4 can render a visible DRAFT marker.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS, all content tests plus the guard.

- [ ] **Step 5: Commit**

```bash
git add src/content tests/content
git commit -m "Add typed content module as CV source of truth

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Layout shell

**Files:**
- Create: `src/components/layout/Nav.tsx`, `Footer.tsx`, `SkipLink.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/components/layout.test.tsx`

**Interfaces:**
- Consumes: `identity` from `@/content`.
- Produces: `<Nav />`, `<Footer />`, `<SkipLink />`. Layout renders `<SkipLink/><Nav/><main id="main">{children}</main><Footer/>`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import SkipLink from '@/components/layout/SkipLink'

describe('layout shell', () => {
  it('skip link targets main', () => {
    render(<SkipLink />)
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main')
  })

  it('nav exposes the site sections', () => {
    render(<Nav />)
    const nav = screen.getByRole('navigation', { name: /primary/i })
    expect(nav).toBeInTheDocument()
    for (const label of ['Work', 'Research', 'About', 'Contact']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }
  })

  it('footer shows availability and contact routes but no phone', () => {
    render(<Footer />)
    expect(screen.getByText('Open to conversations')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /koinchsushan@gmail\.com/ })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/\+?\d{10,}/)
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL, modules not found.
- [ ] **Step 3: Implement.** Semantic only: `<nav aria-label="Primary">`, `<footer>`, one `<h1>` reserved for the page. No styling beyond structural Tailwind.
- [ ] **Step 4: Run tests** — Expected: PASS.
- [ ] **Step 5: Commit** — `git commit -m "Add semantic layout shell"` (with trailer).

---

### Task 4: Home page — eight static movements

**Files:**
- Create: `src/components/sections/{Hero,Position,Work,Research,Stack,Trajectory,About,Contact}.tsx`
- Create: `src/components/primitives/DraftNote.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/pages/home.test.tsx`

**Interfaces:**
- Consumes: all of `@/content`; `<DraftNote>` renders a visible `DRAFT — owner to rewrite` marker.
- Produces: eight section components, each `<section>` with an `aria-labelledby` heading.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from '@/app/page'

describe('home page', () => {
  it('has exactly one h1 carrying the name', () => {
    render(<Home />)
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('Sushan Sunuwar')
  })

  it('renders all eight movements as labelled sections', () => {
    const { container } = render(<Home />)
    const sections = container.querySelectorAll('section[aria-labelledby]')
    expect(sections).toHaveLength(8)
  })

  it('shows the three position metrics', () => {
    render(<Home />)
    expect(screen.getByText(/450,000\+/)).toBeInTheDocument()
    expect(screen.getByText(/10,000\+/)).toBeInTheDocument()
    expect(screen.getByText(/~30%/)).toBeInTheDocument()
  })

  it('links each case study to its route', () => {
    render(<Home />)
    // Scoped to the work region: Task 11 adds a logo row to this same page.
    const work = screen.getByRole('region', { name: /selected work/i })
    for (const slug of ['foundermatcha', 'viveka-health', 'proponent']) {
      expect(within(work).getByRole('link', { name: new RegExp(slug.split('-')[0], 'i') }))
        .toHaveAttribute('href', `/work/${slug}`)
    }
  })

  it('lists research repos as external links', () => {
    render(<Home />)
    const cards = screen.getByRole('region', { name: /research/i })
    expect(within(cards).getAllByRole('link').length).toBeGreaterThanOrEqual(3)
  })

  it('exposes the full stack as text for screen readers and SEO', () => {
    render(<Home />)
    // Assertions may only name technologies present in the CV skill groups.
    expect(screen.getByText('Single-SPA')).toBeInTheDocument()
    expect(screen.getByText('Redux-Saga')).toBeInTheDocument()
  })

  it('marks draft copy visibly', () => {
    render(<Home />)
    expect(screen.getAllByText(/DRAFT — owner to rewrite/).length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL.
- [ ] **Step 3: Implement the eight sections** per spec §5, movements 1–8. No boot overlay yet (Task 17), no motion, no shader, no canvas. `Stack` renders the plain `<ul>` of skill groups that will later become the 3D object's accessible mirror. `About` renders the bio wrapped in `<DraftNote>`.
- [ ] **Step 4: Run tests** — Expected: PASS.
- [ ] **Step 5: Commit.**

---

### Task 5: Case study routes

**Files:**
- Create: `src/app/work/[slug]/page.tsx`, `src/components/case-study/{Masthead,Situation,Constraint,Decision,Outcome,NextPrev}.tsx`
- Test: `tests/pages/case-study.test.tsx`

**Interfaces:**
- Consumes: `getCaseStudy`, `caseStudies`.
- Produces: `generateStaticParams()` returning all three slugs; the six-block template from spec §5b.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Page, { generateStaticParams } from '@/app/work/[slug]/page'
import { caseStudies } from '@/content'

describe('case study routes', () => {
  it('statically generates all three', async () => {
    expect(await generateStaticParams()).toEqual([
      { slug: 'foundermatcha' }, { slug: 'viveka-health' }, { slug: 'proponent' },
    ])
  })

  it.each(caseStudies.map((c) => c.slug))('%s renders the full template', async (slug) => {
    render(await Page({ params: Promise.resolve({ slug }) }))
    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByTestId('constraint')).toBeInTheDocument()
    expect(screen.getAllByTestId('outcome-metric').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('navigation', { name: /more work/i })).toBeInTheDocument()
  })

  it('names Proponent and Javra but no internal product', async () => {
    render(await Page({ params: Promise.resolve({ slug: 'proponent' }) }))
    const text = document.body.textContent ?? ''
    expect(text).toContain('Proponent')
    expect(text).toContain('Javra')
    expect(text).toMatch(/quotation system/i)
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL.
- [ ] **Step 3: Implement** the template. Diagram slot renders a placeholder `<figure data-diagram={cs.diagram}>` — Task 9 fills it.
- [ ] **Step 4: Run tests** — Expected: PASS, and `npm test` still green including the guard.
- [ ] **Step 5: Commit.**

---

### Task 6: Research page + resume route + Stage 1 checkpoint

**Files:**
- Create: `src/app/research/page.tsx`, `src/app/resume/route.ts`
- Create: `public/sushan-sunuwar-cv.pdf` (copy from `~/Documents/sushan_FE_CV.pdf`)
- Test: `tests/pages/research.test.tsx`

**Interfaces:**
- Consumes: `research`, `education`.
- Produces: `/research` static page; `/resume` returning the PDF with `Content-Type: application/pdf` and `Content-Disposition: inline; filename="sushan-sunuwar-cv.pdf"`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ResearchPage from '@/app/research/page'

describe('research page', () => {
  it('lists three studies with repo links and no "dissertation"', () => {
    render(<ResearchPage />)
    expect(screen.getAllByRole('link', { name: /github\.com|repository/i }).length).toBeGreaterThanOrEqual(3)
    expect(document.body.textContent).not.toMatch(/dissertation/i)
  })

  it('shows the CardsProblemAnalysis licence and forks', () => {
    render(<ResearchPage />)
    expect(screen.getByText('MIT')).toBeInTheDocument()
    expect(screen.getByText(/3 forks/)).toBeInTheDocument()
  })
})
```

`tests/pages/resume.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { existsSync, statSync } from 'node:fs'
import { GET } from '@/app/resume/route'

describe('/resume', () => {
  it('the PDF is present and non-trivial', () => {
    expect(existsSync('public/sushan-sunuwar-cv.pdf')).toBe(true)
    expect(statSync('public/sushan-sunuwar-cv.pdf').size).toBeGreaterThan(50_000)
  })

  it('serves it inline as a PDF', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
    expect(res.headers.get('content-disposition')).toContain('sushan-sunuwar-cv.pdf')
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL.
- [ ] **Step 3: Implement.** Copy the PDF: `cp ~/Documents/sushan_FE_CV.pdf public/sushan-sunuwar-cv.pdf`.
- [ ] **Step 4: Verify the whole stage**

Run: `npm test && npm run build`
Expected: all tests pass; build emits `/`, `/work/foundermatcha`, `/work/viveka-health`, `/work/proponent`, `/research`, `/resume`.

- [ ] **Step 5: Commit, then STOP for owner checkpoint.**

Ask: *"Stage 1 done — every route, every real word, no styling. Read the copy, especially the DRAFT bio and the three case-study constraints. What's wrong?"*

---

# STAGE 2 — DESIGN SYSTEM

Deliverable: the site looks like something. Still no motion.

---

### Task 7: Tokens and typography

**Files:**
- Create: `src/styles/tokens.css`, `src/app/fonts.ts`
- Create: `src/fonts/` (UncutSans-Variable.woff2, CommitMono-Variable.woff2)
- Modify: `src/app/globals.css`, `src/app/layout.tsx`
- Test: `tests/design/tokens.test.ts`

**Interfaces:**
- Produces: CSS custom properties `--ink --carbon --steel --bone --ember --abyss`; fluid type scale `--fs-{12,14,16,18,22,28,40,64,104,160}`; spacing `--sp-{4..256}`; easings `--ease-entrance`, `--ease-micro`. Tailwind v4 `@theme` maps these to utilities.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const css = readFileSync('src/styles/tokens.css', 'utf8')

describe('design tokens', () => {
  it('defines the six palette tokens with the spec values', () => {
    for (const [name, hex] of Object.entries({
      ink: '#08090C', carbon: '#101319', steel: '#7B8794',
      bone: '#ECEAE5', ember: '#FF5A1F', abyss: '#0B1F3A',
    })) {
      expect(css).toMatch(new RegExp(`--${name}:\\s*${hex}`, 'i'))
    }
  })

  it('never uses pure white', () => {
    expect(css).not.toMatch(/#fff\b|#ffffff/i)
  })

  it('defines the full fluid type scale', () => {
    for (const s of [12, 14, 16, 18, 22, 28, 40, 64, 104, 160]) {
      expect(css).toContain(`--fs-${s}:`)
    }
  })

  it('defines the two easings from the motion grammar', () => {
    expect(css).toContain('cubic-bezier(0.16, 1, 0.3, 1)')
    expect(css).toContain('cubic-bezier(0.4, 0, 0.2, 1)')
  })
})
```

- [ ] **Step 2: Run it** — Expected: FAIL, file missing.
- [ ] **Step 3: Write `tokens.css` and wire fonts.**

Download Uncut Sans (OFL) and Commit Mono (OFL) into `src/fonts/`. If Uncut Sans licensing blocks it, substitute Instrument Sans and note it in the commit body. `src/app/fonts.ts` uses `next/font/local` with `display: 'swap'` and Latin subsetting.

Fluid sizes use `clamp()`; display sizes carry `letter-spacing: -0.03em; line-height: 0.92`.

- [ ] **Step 4: Run tests** — Expected: PASS.
- [ ] **Step 5: Commit.**

---

### Task 8: Primitives

**Files:**
- Create: `src/components/primitives/{MonoLabel,Metric,Rule,SectionHeader,ActionLink,ExternalLink}.tsx`
- Test: `tests/components/primitives.test.tsx`

**Interfaces:**
- Produces: `<MonoLabel>`, `<Metric value label />`, `<Rule />`, `<SectionHeader index title id />`, `<ActionLink href children />` (magnetic behaviour added in Task 13; renders as a plain `<a>` now), `<ExternalLink>` (adds `rel="noreferrer noopener"`, `target="_blank"`, and a visually-hidden "(opens in a new tab)").

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Metric from '@/components/primitives/Metric'
import ExternalLink from '@/components/primitives/ExternalLink'
import SectionHeader from '@/components/primitives/SectionHeader'

describe('primitives', () => {
  it('Metric pairs a figure with its label', () => {
    render(<Metric value="450,000+" label="union members" />)
    expect(screen.getByText('450,000+')).toBeInTheDocument()
    expect(screen.getByText('union members')).toBeInTheDocument()
  })

  it('ExternalLink is safe and announced', () => {
    render(<ExternalLink href="https://example.com">Repo</ExternalLink>)
    const a = screen.getByRole('link')
    expect(a).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    expect(a).toHaveAccessibleName(/opens in a new tab/i)
  })

  it('SectionHeader wires aria-labelledby correctly', () => {
    render(<SectionHeader index="03" title="Selected Work" id="work" />)
    expect(screen.getByRole('heading', { name: /selected work/i })).toHaveAttribute('id', 'work')
  })
})
```

- [ ] **Step 2: Run it** — FAIL. **Step 3: Implement. Step 4: PASS. Step 5: Commit.**

---

### Task 9: Generative diagram system

The thing that replaces screenshots. Three SVG diagrams, one per case study, each encoding that project's real engineering (spec §5.3).

**Files:**
- Create: `src/components/graphics/{Diagram,ConvergeDiagram,SplitDiagram,ExtractDiagram}.tsx`
- Create: `src/components/graphics/geometry.ts`
- Test: `tests/components/diagrams.test.tsx`

**Interfaces:**
- Consumes: `DiagramId` from `@/content`.
- Produces: `<Diagram id={DiagramId} progress={number} title={string} />` where `progress` is 0–1 and drives staged construction. The root element carries `data-progress={progress}` (Task 16 asserts on it) **and** each stage carries `data-stage` plus `data-built={'true'|'false'}`. At `progress=1` every diagram is fully built — that is the static and reduced-motion state. `geometry.ts` exports pure functions returning path data, so they are unit-testable without rendering.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Diagram from '@/components/graphics/Diagram'
import { convergePaths, splitLanes, extractFields } from '@/components/graphics/geometry'

describe('diagram geometry', () => {
  it('converge: four sources into one layer feeding five surfaces', () => {
    const g = convergePaths()
    expect(g.sources).toHaveLength(4)
    expect(g.surfaces).toHaveLength(5)
  })

  it('split: one train into five module lanes', () => {
    expect(splitLanes()).toHaveLength(5)
  })

  it('extract: unstructured lines resolve to structured fields', () => {
    const f = extractFields()
    expect(f.length).toBeGreaterThanOrEqual(4)
    expect(f.every((x) => typeof x.label === 'string' && x.label.length > 0)).toBe(true)
  })
})

describe('Diagram', () => {
  it('is fully built at progress 1 and labelled', () => {
    render(<Diagram id="split" progress={1} title="Release train splitting into five module lanes" />)
    const svg = screen.getByRole('img', { name: /five module lanes/i })
    expect(svg).toBeInTheDocument()
    expect(svg.querySelectorAll('[data-stage]').length).toBeGreaterThan(0)
  })

  it('renders nothing beyond the frame at progress 0', () => {
    const { container } = render(<Diagram id="split" progress={0} title="t" />)
    const built = container.querySelectorAll('[data-stage][data-built="true"]')
    expect(built).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run it** — FAIL.
- [ ] **Step 3: Implement.** Pure SVG, palette tokens only, `ember` on at most one element per diagram. `role="img"` + `<title>`. `progress` maps to `data-built` per stage — no animation library involved, so the same component serves the static, reduced-motion, and scroll-driven cases.
- [ ] **Step 4: PASS. Step 5: Commit.**

---

### Task 10: Headshot treatment and About

**Files:**
- Create: `src/components/about/Portrait.tsx`
- Create: `public/sushan.jpg` (owner-supplied)
- Modify: `src/components/sections/About.tsx`
- Test: `tests/components/portrait.test.tsx`

**Interfaces:**
- Produces: `<Portrait />` — `next/image`, width 240, `sizes="240px"`, duotone via CSS `filter: grayscale(1) contrast(1.05)` plus a `--steel`→`--bone` gradient overlay in `mix-blend-mode: color`. Descriptive alt text. Never a hero element.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Portrait from '@/components/about/Portrait'

describe('Portrait', () => {
  it('is modestly sized with descriptive alt text', () => {
    render(<Portrait />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('alt', expect.stringMatching(/Sushan Sunuwar/))
    expect(img.getAttribute('alt')!.length).toBeGreaterThan(25)
    expect(Number(img.getAttribute('width'))).toBeLessThanOrEqual(240)
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement. Step 4: PASS. Step 5: Commit.**

---

### Task 11: Apply the system + Stage 2 checkpoint

**Files:**
- Modify: all section and case-study components
- Create: `src/components/layout/LogoRow.tsx`, `src/components/logos/*.svg`
- Test: `tests/design/system.test.tsx`

**Interfaces:**
- Produces: `<LogoRow />` — five monochrome marks (Viveka Health, Proponent, Javra, Foundermatcha, London Met) as inline SVG with `fill="currentColor"`, coloured `--steel`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { globby } from 'globby'
import LogoRow from '@/components/layout/LogoRow'

describe('design system application', () => {
  it('logos are monochrome — no hardcoded brand colour', async () => {
    for (const f of await globby('src/components/logos/*.svg')) {
      const svg = readFileSync(f, 'utf8')
      expect(svg).not.toMatch(/#[0-9a-f]{3,8}/i)
      expect(svg).toContain('currentColor')
    }
  })

  it('renders five client marks', () => {
    const { container } = render(<LogoRow />)
    expect(container.querySelectorAll('svg')).toHaveLength(5)
  })

  it('no component hardcodes a hex colour outside tokens.css', async () => {
    const files = await globby(['src/**/*.{tsx,ts}'])
    const offenders = files.filter((f) => /#[0-9a-f]{6}\b/i.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Apply tokens across every component; redraw logos as monochrome SVG. Step 4: PASS.**
- [ ] **Step 5: Commit, then STOP for owner checkpoint.**

Ask: *"Stage 2 done — palette, type, diagrams, portrait, logos. Does it look like you? Nothing moves yet."*

---

# STAGE 3 — MOTION & 3D

Layer one moment at a time. Run Lighthouse after each.

---

### Task 12: Motion foundation

**Files:**
- Create: `src/lib/useReducedMotion.ts`, `src/lib/useCapability.ts`, `src/components/motion/SmoothScroll.tsx`
- Test: `tests/lib/motion.test.ts`

**Interfaces:**
- Produces:
  - `useReducedMotion(): boolean` — live, subscribes to the media query.
  - `useCapability(): { tier: 'full' | 'lite' | 'static' }` — `static` when reduced-motion, no WebGL, `deviceMemory < 4`, or `hardwareConcurrency < 4`; `lite` on coarse pointer or viewport < 768; else `full`.
  - `<SmoothScroll>` — Lenis, disabled entirely when `useReducedMotion()` is true.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useCapability } from '@/lib/useCapability'

function mockEnv(o: { reduced?: boolean; webgl?: boolean; mem?: number; cores?: number; width?: number }) {
  vi.stubGlobal('matchMedia', (q: string) => ({
    matches: q.includes('reduced-motion') ? !!o.reduced : q.includes('coarse') ? false : false,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }))
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockImplementation(() => (o.webgl === false ? null : ({} as never)))
  Object.defineProperty(navigator, 'deviceMemory', { value: o.mem ?? 8, configurable: true })
  Object.defineProperty(navigator, 'hardwareConcurrency', { value: o.cores ?? 8, configurable: true })
  Object.defineProperty(window, 'innerWidth', { value: o.width ?? 1440, configurable: true })
}

describe('useCapability', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('is full on a capable desktop', () => {
    mockEnv({})
    expect(renderHook(() => useCapability()).result.current.tier).toBe('full')
  })

  it('is static when the user asks for reduced motion', () => {
    mockEnv({ reduced: true })
    expect(renderHook(() => useCapability()).result.current.tier).toBe('static')
  })

  it('is static without WebGL', () => {
    mockEnv({ webgl: false })
    expect(renderHook(() => useCapability()).result.current.tier).toBe('static')
  })

  it('is static on a weak device', () => {
    mockEnv({ mem: 2, cores: 2 })
    expect(renderHook(() => useCapability()).result.current.tier).toBe('static')
  })

  it('is lite on a narrow viewport', () => {
    mockEnv({ width: 420 })
    expect(renderHook(() => useCapability()).result.current.tier).toBe('lite')
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement (`npm i lenis`). Step 4: PASS. Step 5: Commit.**

---

### Task 13: Reveals and magnetic actions

**Files:**
- Create: `src/components/motion/Reveal.tsx`, `src/components/motion/Magnetic.tsx`
- Modify: `src/components/primitives/ActionLink.tsx`
- Test: `tests/components/reveal.test.tsx`

**Interfaces:**
- Produces: `<Reveal as="h2" stagger={80}>` — line-mask reveal via IntersectionObserver + CSS; renders content **visible and unstyled** when `useReducedMotion()` is true or JS has not hydrated. `<Magnetic strength={0.3}>` — pointer-follow transform, no-op on coarse pointer and under reduced motion.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Reveal from '@/components/motion/Reveal'

describe('Reveal', () => {
  it('content is present in the DOM before any observer fires', () => {
    render(<Reveal as="h2">Selected Work</Reveal>)
    expect(screen.getByText('Selected Work')).toBeInTheDocument()
  })

  it('is immediately visible under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    render(<Reveal as="h2">Selected Work</Reveal>)
    expect(screen.getByText('Selected Work')).toHaveAttribute('data-revealed', 'true')
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement. Step 4: PASS. Step 5: Commit.**

---

### Task 14: SIGNATURE 1 — hero liquid field

**Files:**
- Create: `src/components/three/HeroField.tsx`, `src/components/three/shaders/flow.frag.glsl`, `src/components/three/shaders/screen.vert.glsl`
- Create: `src/components/sections/HeroCanvas.tsx` (dynamic wrapper), `public/hero-poster.webp`
- Modify: `src/components/sections/Hero.tsx`
- Test: `tests/components/hero.test.tsx`

**Interfaces:**
- Consumes: `useCapability()`.
- Produces: `<HeroCanvas />` — `next/dynamic` with `ssr: false`; renders `<img src="/hero-poster.webp">` at identical dimensions until the canvas is ready, and permanently when `tier !== 'full'`.

Shader: curl-noise flow field, `--ink`→`--abyss`, low-density `--ember` filaments, displaced by cursor velocity with exponential decay. DPR capped at 1.5. rAF paused via IntersectionObserver and `visibilitychange`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Hero from '@/components/sections/Hero'

vi.mock('@/lib/useCapability', () => ({ useCapability: () => ({ tier: 'static' }) }))

describe('Hero', () => {
  it('shows the poster and never mounts a canvas on the static tier', () => {
    const { container } = render(<Hero />)
    expect(screen.getByRole('presentation', { hidden: true })).toHaveAttribute('src', '/hero-poster.webp')
    expect(container.querySelector('canvas')).toBeNull()
  })

  it('the h1 is real text, not painted into the canvas', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sushan Sunuwar')
  })
})
```

- [ ] **Step 2: FAIL.**
- [ ] **Step 3: Implement.** `npm i three @react-three/fiber @react-three/drei`. Generate `hero-poster.webp` by screenshotting the shader at t=0 and exporting at 1600×900, ≤40kb.
- [ ] **Step 4: PASS, then measure**

Run: `npm run build && npx serve out` and Lighthouse on `/`.
Expected: initial JS ≤ 120kb gz (three.js must be in a separate lazy chunk), CLS ≤ 0.02.

- [ ] **Step 5: Commit.**

---

### Task 15: SIGNATURE 2 — cursor-reactive truncated icosahedron

**Files:**
- Create: `src/components/three/StackObject.tsx`, `src/components/three/faceAtlas.ts`
- Create: `src/components/marks/*.svg` (custom stack marks, drawn for this project)
- Modify: `src/components/sections/Stack.tsx`
- Test: `tests/components/stack.test.tsx`

**Interfaces:**
- Consumes: `skillGroups`, `useCapability()`.
- Produces: `<StackObject />` — truncated icosahedron (32 faces), marks packed into an SDF atlas by `faceAtlas.ts`. Ambient drift; spring-damped tilt toward cursor. Hovering a face reveals its label plus one line of context.
- **Accessibility contract:** a visually-hidden `<ul>` lists every technology and its context line, always present regardless of tier. Arrow keys rotate; Tab cycles faces; Enter opens a label. On `lite`, low-poly with tap-to-focus and no post-processing. On `static`, a fixed hero angle rendered as a pre-baked image.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Stack from '@/components/sections/Stack'

vi.mock('@/lib/useCapability', () => ({ useCapability: () => ({ tier: 'static' }) }))

describe('Stack', () => {
  it('mirrors the whole stack as text on every tier', () => {
    render(<Stack />)
    const list = screen.getByRole('list', { name: /technology stack/i })
    expect(within(list).getAllByRole('listitem').length).toBeGreaterThanOrEqual(20)
    expect(within(list).getByText(/Single-SPA/)).toBeInTheDocument()
  })

  it('falls back to a still image, not an empty box', () => {
    render(<Stack />)
    expect(screen.getByAltText(/tech stack/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement.** Marks must be drawn, not downloaded — no icon pack (Global Constraints).
- [ ] **Step 4: PASS + Lighthouse.** Expected: desktop ≥ 90.
- [ ] **Step 5: Commit.**

---

### Task 16: SIGNATURE 3 — pinned case-study narrative

**Files:**
- Create: `src/components/motion/PinnedStory.tsx`
- Modify: `src/components/sections/Work.tsx`
- Test: `tests/components/pinned.test.tsx`

**Interfaces:**
- Consumes: GSAP ScrollTrigger, `<Diagram>`, `useCapability()`.
- Produces: `<PinnedStory study={CaseStudy} />` — pins, scrubs `Diagram.progress` 0→1 while advancing the four narrative beats, then releases. On `lite`/`static`: **no pinning at all** — renders stacked beats with `progress={1}`.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PinnedStory from '@/components/motion/PinnedStory'
import { caseStudies } from '@/content'

vi.mock('@/lib/useCapability', () => ({ useCapability: () => ({ tier: 'lite' }) }))

describe('PinnedStory', () => {
  it('never pins on lite and shows every beat with a complete diagram', () => {
    const { container } = render(<PinnedStory study={caseStudies[0]} />)
    expect(container.querySelector('[data-pinned="true"]')).toBeNull()
    expect(screen.getAllByTestId('beat')).toHaveLength(4)
    expect(container.querySelector('[data-progress="1"]')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement** (`npm i gsap`). Register ScrollTrigger only on the `full` tier; always `ScrollTrigger.kill()` on unmount.
- [ ] **Step 4: PASS + manual mobile check at 375px — confirm nothing pins. Step 5: Commit.**

---

### Task 17: Boot loader

**Files:**
- Create: `src/components/motion/Boot.tsx`
- Modify: `src/app/layout.tsx`
- Test: `tests/components/boot.test.tsx`

**Interfaces:**
- Produces: `<Boot />` — mono percentage counter and self-drawing hairline. **Hard 1.4s cap**, skippable on any keypress/click/tap, `sessionStorage` key `boot-seen` skips it entirely on repeat visits. Never blocks LCP: renders as an overlay above already-painted content. Skipped outright under reduced motion.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Boot from '@/components/motion/Boot'

describe('Boot', () => {
  beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers() })

  it('dismisses itself within the 1.4s cap', () => {
    render(<Boot />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1400) })
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('does not render at all on a repeat visit', () => {
    sessionStorage.setItem('boot-seen', '1')
    render(<Boot />)
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('page content is in the DOM behind it', () => {
    render(<><Boot /><h1>Sushan Sunuwar</h1></>)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement. Step 4: PASS. Step 5: Commit.**

---

### Task 18: Route transitions + Stage 3 checkpoint

**Files:**
- Create: `src/components/motion/RouteTransition.tsx`
- Modify: `src/app/layout.tsx`, `src/styles/globals.css`
- Test: `tests/components/route-transition.test.tsx`

**Interfaces:**
- Produces: a View Transitions wipe reusing the hero's noise as a mask. Disabled under reduced motion and where `document.startViewTransition` is absent — navigation still works, plainly.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RouteTransition from '@/components/motion/RouteTransition'

describe('RouteTransition', () => {
  it('renders children when the API is unavailable', () => {
    vi.stubGlobal('document', { ...document, startViewTransition: undefined })
    render(<RouteTransition><p>content</p></RouteTransition>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement. Step 4: PASS + Lighthouse on every route.**
- [ ] **Step 5: Commit, then STOP for owner checkpoint.**

Ask: *"Stage 3 done — all three signature moments. Check it on your phone. Anything feel gimmicky? I'd rather cut than defend."*

---

# STAGE 4 — WIRING

---

### Task 19: Contact form

**Files:**
- Create: `src/lib/contactSchema.ts`, `src/app/api/contact/route.ts`, `src/components/contact/ContactForm.tsx`
- Create: `.env.local.example`
- Modify: none — `next.config.ts` already uses default output per Global Constraints. Confirm `output: 'export'` is absent before starting.
- Test: `tests/lib/contactSchema.test.ts`, `tests/api/contact.test.ts`

**Interfaces:**
- Produces: `contactSchema` (Zod) shared client and server — `{ name: string(2..80), email: email(), message: string(20..2000), website: string().max(0), startedAt: number().int().positive() }` where `website` is the honeypot and `startedAt` is the epoch-ms the form was first focused. The route rejects with `400` when `Date.now() - startedAt < 1500`. Route returns `202` on success, `400` on validation failure, `429` when rate-limited.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/contactSchema'

describe('contactSchema', () => {
  const valid = { name: 'Ada', email: 'a@b.com', message: 'x'.repeat(25), website: '', startedAt: Date.now() - 5000 }

  it('accepts a well-formed message', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...valid, website: 'spam' }).success).toBe(false)
  })

  it('rejects a bad email and a too-short message', () => {
    expect(contactSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
    expect(contactSchema.safeParse({ ...valid, message: 'hi' }).success).toBe(false)
  })
})
```

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const send = vi.fn().mockResolvedValue({ data: { id: '1' } })
vi.mock('resend', () => ({ Resend: class { emails = { send } } }))

const post = async (body: unknown, headers: Record<string, string> = {}) => {
  const { POST } = await import('@/app/api/contact/route')
  return POST(new Request('http://localhost/api/contact', {
    method: 'POST', body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.2.3.4', ...headers },
  }))
}

const valid = { name: 'Ada', email: 'a@b.com', message: 'x'.repeat(25), website: '', startedAt: Date.now() - 5000 }

describe('POST /api/contact', () => {
  beforeEach(() => { send.mockClear(); vi.resetModules() })

  it('accepts a valid submission and sends exactly one email', async () => {
    const res = await post(valid)
    expect(res.status).toBe(202)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid input without sending', async () => {
    expect((await post({ ...valid, email: 'nope' })).status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it('silently drops honeypot spam without sending', async () => {
    expect((await post({ ...valid, website: 'x' })).status).toBe(202)
    expect(send).not.toHaveBeenCalled()
  })

  it('rejects a submission completed implausibly fast', async () => {
    expect((await post({ ...valid, startedAt: Date.now() - 300 })).status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it('rate-limits a flood from one address', async () => {
    for (let i = 0; i < 3; i++) await post(valid)
    expect((await post(valid)).status).toBe(429)
  })
})
```

- [ ] **Step 2: Run both** — Expected: FAIL.
- [ ] **Step 3: Implement.** `npm i zod resend`. Verify first: `grep -n "output" next.config.ts` must not show `'export'`. Honeypot hits return `202` so bots learn nothing. Form states idle/submitting/success/error announced via `aria-live="polite"`; errors tied to inputs with `aria-describedby` + `aria-invalid`. `.env.local.example` documents `RESEND_API_KEY` and `CONTACT_TO=koinchsushan@gmail.com`.
- [ ] **Step 4: PASS. Step 5: Commit.**

---

### Task 20: SEO, OG, sitemap, structured data

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/work/[slug]/opengraph-image.tsx`, `src/lib/jsonLd.ts`
- Modify: every `page.tsx` (add `generateMetadata`)
- Test: `tests/seo/metadata.test.ts`

**Interfaces:**
- Produces: per-route `generateMetadata`; `sitemap()` listing all six routes; `personJsonLd()` and `caseStudyJsonLd(cs)`; OG images generated with `next/og` in the site palette — **never the headshot**.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import { personJsonLd } from '@/lib/jsonLd'
import { generateMetadata as workMeta } from '@/app/work/[slug]/page'

describe('seo', () => {
  it('sitemap lists every route', () => {
    const urls = sitemap().map((e) => new URL(e.url).pathname)
    expect(urls).toEqual(expect.arrayContaining([
      '/', '/work/foundermatcha', '/work/viveka-health', '/work/proponent', '/research',
    ]))
  })

  it('Person JSON-LD is well formed and carries no phone', () => {
    const p = personJsonLd()
    expect(p['@type']).toBe('Person')
    expect(p.name).toBe('Sushan Sunuwar')
    expect(JSON.stringify(p)).not.toMatch(/telephone|\+?\d{10,}/)
  })

  it('each case study gets a distinct title and description', async () => {
    const a = await workMeta({ params: Promise.resolve({ slug: 'proponent' }) })
    const b = await workMeta({ params: Promise.resolve({ slug: 'viveka-health' }) })
    expect(a.title).not.toEqual(b.title)
    expect(String(a.description).length).toBeGreaterThan(50)
  })
})
```

- [ ] **Step 2: FAIL. Step 3: Implement. Step 4: PASS. Step 5: Commit.**

---

### Task 21: Accessibility audit, performance verification, deploy

**Files:**
- Create: `tests/a11y/axe.spec.ts` (Playwright), `playwright.config.ts`, `.github/workflows/ci.yml`
- Test: the whole suite

**Interfaces:**
- Produces: CI running `npm test` + `npm run build` + Playwright axe on all six routes, in both default and reduced-motion contexts.

- [ ] **Step 1: Write the failing a11y spec**

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = ['/', '/work/foundermatcha', '/work/viveka-health', '/work/proponent', '/research']

for (const route of ROUTES) {
  test(`${route} has no detectable a11y violations`, async ({ page }) => {
    await page.goto(route)
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(violations).toEqual([])
  })

  test(`${route} is fully keyboard navigable`, async ({ page }) => {
    await page.goto(route)
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
  })
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('home renders a complete static composition', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.locator('[data-revealed="false"]')).toHaveCount(0)
  })
})
```

- [ ] **Step 2: Run it** — `npx playwright test`. Expected: FAIL initially; fix every violation found.
- [ ] **Step 3: Verify budgets**

Run Lighthouse on `/` and one case study, mobile and desktop.
Required: mobile ≥ 95, desktop ≥ 90, CLS ≤ 0.02, LCP ≤ 1.8s. If desktop misses, reduce the 3D object's poly count before touching anything else.

- [ ] **Step 4: Deploy**

```bash
npx vercel --prod
```
Set `RESEND_API_KEY` and `CONTACT_TO` in Vercel project settings. Submit the live form and confirm delivery.

- [ ] **Step 5: Commit and report.**

Report to the owner: live URL, final Lighthouse numbers for all four runs, and the list of items still marked `DRAFT` awaiting their rewrite.

---

## Verification summary

Nothing is "done" without output pasted back:

| Claim | Command |
|---|---|
| Tests pass | `npm test` |
| Build works | `npm run build` |
| No confidentiality leak | `npm test -- tests/guards` |
| No a11y violations | `npx playwright test` |
| Budgets met | Lighthouse, 4 runs |
| Form works | live submission received |

---

# PLAN AMENDMENT — 2026-09-07 (supersedes Tasks 3–21)

Owner direction mid-execution: *"Do not over-engineer it, it's just a portfolio.
The app looks too test-heavy. Cut down the test and review so I'll burn fewer
tokens."* Accepted. This amendment supersedes the task list above from Task 3 on.

## What is cut

**Tests.** The original plan specified ~16 test files. Seven survive, chosen
because they protect something a human cannot eyeball:

| Keep | Why it survives |
|---|---|
| `tests/guards/confidentiality.test.ts` | Protects a real client's confidentiality and the owner's phone number. Silent failure mode. |
| `tests/content/integrity.test.ts` | Protects against fabricated facts on a real person's CV. Silent failure mode. |
| `tests/design/tokens.test.ts` | Cheap, catches palette drift across many files. |
| `tests/lib/capability.test.ts` | Gates every 3D/motion fallback. Can't be eyeballed — you'd need four devices. |
| `tests/lib/contactSchema.test.ts` + `tests/api/contact.test.ts` | Real backend logic with spam handling. |
| `tests/pages/render.test.tsx` | One smoke test: routes render, no crash, draft markers visible. |
| `tests/a11y/axe.spec.ts` | Keyboard + contrast, once, at the end. |

**Deleted outright:** per-component tests for primitives, Reveal, Boot, Diagram
geometry, Portrait, LogoRow, layout shell, resume route, SEO metadata. These
test visual code the owner will judge by looking at it. TDD earns its keep on
logic and silent failures, not on whether a heading renders.

**Reviews.** Per-task reviewer dispatch drops from every task to three:
Task A (all site content), Task E (contact form), and the final pass. Visual
tasks are reviewed by the owner at the two stage checkpoints, which is the
correct reviewer for visual work.

**Tasks.** 21 → 12, by merging tasks that share files and a single test cycle.

## Amended task list

| # | Was | Scope | Test | Reviewed |
|---|---|---|---|---|
| A | 3,4,5,6 | Layout shell, 8 home sections, 3 case-study routes, `/research`, `/resume` | one render smoke test | yes |
| B | 7,8,11 | Tokens, type scale, primitives, applied across every component; monochrome logo row | tokens test | no |
| C | 9 | Three generative SVG diagrams | none | no |
| D | 10 | Portrait duotone + About layout | none | no |
| E | 12,13 | `useReducedMotion`, `useCapability`, Lenis, Reveal, Magnetic | capability test | no |
| F | 14 | SIGNATURE 1 — hero liquid shader + static poster | none | no |
| G | 15 | SIGNATURE 2 — cursor-reactive truncated icosahedron | none | no |
| H | 16,17,18 | SIGNATURE 3 — pinned narrative, boot loader, route transitions | none | no |
| I | 19 | Contact form: Zod, Resend, honeypot, timing, rate limit | schema + route tests | yes |
| J | 20,21 | SEO/OG/sitemap/JSON-LD, axe pass, Lighthouse, deploy | axe spec | yes (final) |

**STAGE CHECKPOINTS UNCHANGED.** Owner reviews after Task A (words), after
Task D (looks), and after Task H (motion). Those are the real quality gates.

## Design skills — correction

The original plan was written without invoking the design skills the owner
named in the brief. Before Task B, load `frontend-design` and `taste-skill` and
let them critique the spec's §3 design system (palette, type, spacing) before it
is implemented. The spec's §3 is a proposal, not settled: if those skills say
the palette or type pairing reads as templated, change it and note the change.

## Unchanged

Everything in Global Constraints still binds — confidentiality, no invented
facts, no phone number, `output: 'export'` never set, the mobile and
reduced-motion fallbacks, and the performance budgets. Cutting tests does not
cut requirements.
