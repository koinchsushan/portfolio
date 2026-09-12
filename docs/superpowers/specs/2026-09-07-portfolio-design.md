# Portfolio Site — Design Spec

**Owner:** Sushan Sunuwar
**Date:** 2026-09-07
**Status:** Approved direction, pending spec review

---

## 1. Goal

A personal portfolio for a frontend software engineer with 3+ years commercial
experience, targeting senior frontend / product engineering roles in London.

The constraint that defines the project: **the work cannot be shown.** Three of
four commercial engagements are enterprise B2B systems with no public UI —
union benefits administration, aerospace quotation automation, an early-stage
mobile product with no published screenshots. There is no visual gallery to
build.

The response is not to fake one. The site argues that Sushan thinks in
systems — design tokens, micro-frontend boundaries, component consolidation,
state architecture — by **being** a system, and by rendering each case study's
actual engineering problem as a generative diagram. The site's own craft is the
portfolio piece that the client work cannot be.

### Success criteria

1. A hiring manager understands within 15 seconds what he does and at what level.
2. Each case study communicates a decision, not a task list.
3. Nothing on the site could be mistaken for a template.
4. Lighthouse: 95+ mobile, 90+ desktop. Desktop is lower by deliberate trade —
   the 3D object stays on desktop.
5. Fully usable with keyboard only, and with `prefers-reduced-motion: reduce`.

---

## 2. Content — source of truth

The CV (`~/Documents/sushan_FE_CV.docx`) is authoritative for all facts.
**No metric, date, title or outcome may be invented or rounded up.**

### Identity

| Field | Value |
|---|---|
| Name | Sushan Sunuwar |
| Title | Frontend Software Engineer |
| Strapline | React · TypeScript · Product Engineering |
| Location | London, United Kingdom |
| Email | koinchsushan@gmail.com |
| LinkedIn | linkedin.com/in/sushan-sunuwar |
| GitHub | github.com/koinchsushan |
| Availability line | "Open to conversations" |

**Phone number is NOT published.** The CV carries it; a public web page should
not. Contact is email, LinkedIn, and the form.

### Confidentiality rules — binding

- **Proponent** may be named as Javra's client. **Javra Software** may be named.
- The internal product name for the quotation system **must never appear** — not
  in copy, not in code, not in comments, not in commit messages, not in alt text.
  Refer to it only as "an ML-powered quotation system" or "the quotation platform".
- **Do not reference Javra's "OrderAI"** product. Confirmed as a different product.
- **Do not link Javra's published Proponent case study.** The URL currently 404s
  and attribution was not granted.
- **Viveka Health** may be named as the platform worked on via Viveka Services.
- **No borrowed screenshots or product imagery** from any client, employer, or
  their marketing sites. Verified there is nothing appropriate to take in any case.
- **Client logos**: permitted, monochrome only, rendered in `label`. No brand colours.
- **Foundermatcha**: use Sushan's own figure of ~3,000 users. Do NOT use the
  company's forward-looking public targets (20,000 by 2027) or its university
  partnership claims — those are the company's, not his.

### Roles

**Foundermatcha** — London, early-stage AI matchmaking startup, live product, ~3,000 users
Software Engineer · Jun 2026 – Current · React, TypeScript, Flutter, Python/Flask, Firebase
- Doubled connections made on the platform by designing the networking layer:
  shareable invite codes, email invites that auto-connect at signup, group chats.
  Kept networking out of the matching pool with a dedicated group data model.
- Replaced email-only support with real-time in-app chat built from scratch;
  extended the React/TS admin panel so staff answer users in one place.
- Opened the product to a second user type via a lightweight member role across
  the React admin panel and Flutter app, including onboarding conversation and
  concierge persona inside the existing LangGraph conversational AI.
- Consolidated four divergent chat implementations into one shared component
  layer now powering all five product surfaces; followed with an app-wide
  design-system pass to a Figma spec, unifying tokens and a single CTA system.
- Built transactional email infrastructure from scratch: provider-agnostic
  transport with a test double, plus a signature-verified bounce webhook
  maintaining a suppression list.
- Two-week cycles in a five-engineer team; scoped with the lead engineer,
  deployed to production himself, used Claude Code throughout.

**Viveka Services** — Remote, US healthcare client (product: Viveka Health)
Frontend Software Engineer · Jul 2024 – Mar 2025 · TypeScript, Single-SPA, Redux, Git
- Shipped micro-frontend modules with Single-SPA on a platform serving
  450,000+ union members, replacing a coordinated release train with
  independent per-squad deployments.
- Built the platform's shared React component library (Material UI,
  Styled-components) to WCAG 2.1 AA — one accessible, Figma-accurate source of
  UI truth across squads.
- Re-architected global and async state across eligibility processing, contract
  configuration and employee data management, resolving cross-module data
  inconsistencies that surfaced stale records to users.
- Cut bundle size ~30% and lifted Core Web Vitals on the highest-traffic
  workflows via route-level code splitting, lazy loading and tree shaking across
  the Webpack and Vite build.
- Owned the frontend GitLab CI pipeline end to end.
- Drove Jest and React Testing Library coverage under TDD; reviewed PRs for
  architecture, consistency and accessibility regressions.

*Public context (verified):* Viveka Health sells AI-powered union benefits
administration to labor union fund administrators. Its five product areas are
Mobile App & Customer Experience, Eligibility & Enrollment Management, Claims
Administration & Payments, Remittance Reporting & Processing, and Fraud &
Transparency. These map directly onto the micro-frontend boundaries described
above — this is the spine of the case study.

**Javra Software** — Remote, Netherlands (HQ Culemborg); client: Proponent
Frontend Software Engineer · Mar 2022 – Jun 2024 · React, Chart.js, Ant Design
Progression: Intern → Junior Developer → Frontend Developer
- Built the React and TypeScript frontend for an ML-powered quotation system
  extracting structured data from 10,000+ emails per day, replacing a fragmented
  manual process and enabling the operations team to handle quote volume that
  previously required additional headcount.
- Designed interactive Chart.js data-visualisation dashboards used by client
  stakeholders.
- Built and maintained an Ant Design component library adopted across multiple
  client products by a 4–6 engineer team, cutting per-feature build time by 20–30%.
- Embedded React components into live jQuery and .NET MVC systems, enabling
  incremental modernisation without a rewrite or service interruption.
- Kept state management and responsive UI consistent across 3+ concurrent
  client products.

*Public context (verified):* Proponent is the world's largest independent,
employee-owned aerospace parts distributor — ~$114M revenue, 600+ staff,
12 facilities across 8 countries, serving MRO, OEM and commercial airline markets.

**London Metropolitan University** — faculty-led behavioural research study
Lead Developer & Co-Author · Sep 2025 – Current · Python, Flask, Chart.js, Pandas, Matplotlib
- Turned three researchers' separate local Python scripts into one live web
  application covering 845 trials from 228 participants.
- Self-service dataset upload — validated, atomically written, revertible in one
  click — backed by a 21-test suite.
- Interactive visualisation layer: animated trial replay, spatial heatmaps,
  learning curves, error-pattern breakdowns across eight analyses, unified by a
  tokenised design system with full dark mode.
- Published open-source under MIT with a contributor guide and documented
  releases; forked by three collaborators. Co-authoring the resulting paper on
  the blank-card hint effect.
- Repo: github.com/koinchsushan/CardsProblemAnalysis (MIT, 3 forks, no live demo)

### Research studies

Per owner instruction, these are presented as **research studies**, not labelled
as dissertations on the site.

- **UK housing affordability decision-support system** — multi-layer analytics
  pipeline with predictive modelling and SHAP-based interpretability.
  Repo: github.com/koinchsushan/houseAffordabilityDSS
- **Flight price study** — repo: github.com/koinchsushan/flight-price-dissertation
  (display title must not use the word "dissertation")

### Education

- **MSc Data Analytics, Distinction** — London Metropolitan University, May 2025 – Jun 2026.
  Modules: Data Analysis & Visualisation; Programming for Data Analytics
  (Python, R, SQL); Data Mining & Machine Learning; Statistical Modelling & Forecasting.
- **BSc Computer Science and Information Technology** — Tribhuvan University,
  Nepal, 2018 – 2023. Final year project: React application consuming a Naive
  Bayes prediction model over a REST API.

### Skills (verbatim groupings from CV)

Languages · Frontend · Design Systems & UI · Accessibility & Performance ·
Architecture · Backend & APIs · AI-Assisted Development · Cloud & Infrastructure ·
Testing & CI/CD · Data

---

## 3. Design system

### Palette

**Revised after a `frontend-design` critique.** The first proposal — near-black
`#08090C` plus a vermilion `#FF5A1F` accent — is a documented AI-design default,
not a choice. Replaced with a system derived from Sushan's actual subject matter.

The through-line across every project he has shipped is **turning unstructured
mess into structured legibility**: RFQ emails into quotes, three researchers'
local scripts into one readable web app, four chat implementations into one,
a release-train monolith into independent module lanes. His research work is
literally instrumentation — heatmaps, learning curves, trial replay.

So the palette is scientific instrumentation, not developer dark mode. A deep
blue-black plot ground, a graticule, and a two-hue ramp that **encodes
magnitude** rather than shouting for attention.

| Token | Hex | Role |
|---|---|---|
| `--ground` | `#0B1015` | base — a plot background, blue-black, not neutral void |
| `--panel` | `#131B22` | raised surfaces |
| `--grid` | `#22303A` | hairlines, rules, the graticule |
| `--label` | `#8A9BA8` | secondary text, cool grey-blue |
| `--bone` | `#E9E7E2` | primary text — warm off-white against the cool ground |
| `--signal` | `#E3B23C` | warm amber. Instrument panel, brass, sodium lamp |
| `--depth` | `#2A7B8C` | teal. The ramp's cool end |

Rules:
- `--signal` and `--depth` form a **ramp**, and the ramp encodes something real:
  progress through a diagram, magnitude in a chart, sequence in a timeline.
  Never a decorative highlight sprayed across a page.
- `--signal` appears at most once per viewport as a flat accent.
- Gradients exist only in the hero shader and 3D lighting: `ground → depth`
  with a `signal` bleed at the warm end. UI surfaces are flat.
- Warm text on a cool ground is the deliberate tension; do not neutralise it.
- Contrast: `bone` on `ground` 14.9:1. `label` on `ground` 6.8:1. `signal` on
  `ground` 9.1:1. All clear WCAG AA.

### Structural markers

**Revised.** The original `01 / 02 / 03` case-study numbering was decoration —
the reader gains nothing from knowing Viveka is "02". Replaced with **dates**
as the structural marker, which encode something true: the arc runs Nepal →
a Netherlands client → US healthcare → a London startup, and reverse
chronology is the actual sequence. Set in mono, they carry the timeline
without a separate ornament.

### Typography

- **Display & body:** Uncut Sans (open-source Swiss grotesk). Fallback if
  licensing proves awkward: Instrument Sans.
- **Mono:** Commit Mono — section numbers, dates, metrics, labels, code.
- Deliberately **not** Space Grotesk + Inter: that is the most common
  dev-portfolio pairing, and it is what CardsProblemAnalysis already uses. The
  portfolio needs its own voice.
- Self-hosted via `next/font/local`, subset to Latin, `font-display: swap`.

Type scale (fluid, `clamp()`), 1.25 minor-third base stepping to 1.6 at display sizes:
`12 / 14 / 16 / 18 / 22 / 28 / 40 / 64 / 104 / 160`

Display headlines: tracking `-0.03em`, line-height `0.92`.
Body: `1.6` line-height, max measure `68ch`.
Mono labels: `0.08em` tracking, uppercase.

### Spacing

8px base. Scale: `4 8 12 16 24 32 48 64 96 128 192 256`.
Section rhythm: `192px` desktop, `96px` mobile.

### Motion grammar

One easing family, applied everywhere:
- Entrances: `cubic-bezier(0.16, 1, 0.3, 1)`, 600–900ms
- Micro-interactions: `cubic-bezier(0.4, 0, 0.2, 1)`, 150–250ms
- Scrubbed scroll: linear, tied to progress

Rules:
- Three signature moments only. Everything else is a reveal or a hover.
- No animation on more than 2 elements simultaneously outside the signature moments.
- Every reveal is idempotent and completes; nothing depends on animation to
  become readable.

---

## 4. Information architecture

```
/                        single-scroll home, eight movements after boot
/work/foundermatcha      case study 01
/work/viveka-health      case study 02
/work/proponent          case study 03
/research                CardsProblemAnalysis + 2 research studies
/resume                  serves PDF
```

Route transitions use a shared wipe driven by the hero's noise function — the
same visual system, not a generic fade.

---

## 5. Home page — section specs

Boot (0) is an overlay, not a movement. Movements are 1–8.

### 0 · Boot

Loader. Functional cover for WebGL context creation and shader compilation, not
decoration.

- Mono percentage counter, `label` → `bone`, plus a hairline that draws itself
- **Hard 1.4s cap** regardless of load state
- Skippable on any keypress, click or tap
- `sessionStorage`-gated: repeat visits within a session skip entirely
- Never blocks LCP — the hero's static poster is behind it and already painted

### 1 · Hero — SIGNATURE 1: liquid field

Full-viewport fragment shader. Slow curl-noise flow field, `ground → depth`, with
`signal` filaments at low density. Cursor velocity displaces the field with decay.

Over it: name at display scale (160px desktop), title, strapline, availability
line, and two CTAs (View work / Get in touch).

### 2 · Position

High-contrast statement block. Four lines of type at 64px, one `signal` word.
Below: three mono metrics from the CV —
`450,000+ members` · `10,000+ documents / day` · `~30% bundle reduction`

Scroll-triggered line-mask reveal, staggered 80ms. No cards.

### 3 · Selected Work — SIGNATURE 3: pinned narrative

Three case studies. Each pins on scroll; its generative diagram builds in stages
while the story advances problem → constraint → decision → outcome; then releases.

Each diagram encodes the real engineering:
- **Foundermatcha** — four divergent chat nodes converging into one shared
  component layer feeding five product surfaces
- **Viveka Health** — a single monolithic release train splitting into five
  independently-deploying module lanes (Mobile/CX, Eligibility & Enrollment,
  Claims & Payments, Remittance, Fraud & Transparency)
- **Proponent** — an unstructured email stream collapsing into structured
  quote fields

Each links to its full route.

### 4 · Research & Open Source

A separate movement from commercial work, deliberately. This is a body of work
almost no frontend engineer has, and grouping it apart stops it competing with
the case studies while giving the site a fourth act.

- **CardsProblemAnalysis** — the flagship. 845 trials, 228 participants, 21-test
  suite, MIT, 3 forks, co-authored paper in progress. The only project with
  public code to point at. Links to the repo.
- **UK housing affordability decision-support system** — predictive modelling,
  SHAP interpretability. Links to repo.
- **Flight price study** — links to repo. Display title must not contain the
  word "dissertation".

Presentation: three hairline-ruled rows, mono metadata (year, stack, licence,
forks), title at 40px, one line of description. Hover lifts the row and reveals
an `signal` arrow. No cards, no thumbnails. Links to `/research`.

### 5 · Stack — SIGNATURE 2: cursor-reactive 3D object

React Three Fiber. A **truncated icosahedron** — 32 faces (12 pentagonal,
20 hexagonal), enough flat faces to carry the stack legibly, and it reads as a
constructed object rather than a decorative blob. The stack is rendered onto its
faces from **custom SVG marks drawn for this project**, packed into an SDF
texture atlas. No icon pack.

- Ambient drift rotation; tilts toward cursor with spring damping
- Hovering a face pulls out that technology's label with one line of context —
  e.g. "Single-SPA — micro-frontend isolation across squads"
- Keyboard: arrow keys rotate, Tab cycles faces, Enter opens the label.
  A visually-hidden `<ul>` carries the full stack for screen readers and SEO.

Below it, the full CV skill groupings as text.

### 6 · Trajectory

Timeline: Tribhuvan BSc (Nepal) → Javra, intern → junior → frontend (Proponent,
Netherlands) → Viveka Health (US healthcare) → MSc Distinction → Foundermatcha +
LMU research. Mono dates, hairline rules, reveal only.

Below: client logo row, monochrome `label`, small.

### 7 · About

Bio plus headshot at ~240px beside the text, not above it. Headshot duotone-mapped
`label` → `bone` via CSS `filter` + blend so it sits inside the palette rather
than reading as a LinkedIn crop. Source photo is cool-toned, which suits this.

Bio copy is a **DRAFT for owner rewrite** — see §12.

### 8 · Contact

Form, direct email, LinkedIn, GitHub, resume download. Footer with availability line.

---

## 5b. Case study route template

Every `/work/*` page uses one structure, so the three read as a series:

1. **Masthead** — mono index (`01`), client/employer, role, dates, stack row.
   Title at display scale.
2. **The situation** — 2–3 short paragraphs. What existed, who it served, what
   was breaking. Includes verified public context about the company where it
   sharpens the story.
3. **The constraint** — one pulled-out statement at 40px. The thing that made
   the obvious solution unavailable.
4. **The decision** — the engineering judgement, with the generative diagram
   from the home page reused here at full size and fully built (no scroll-pinning
   on the detail page; it renders complete).
5. **Outcome** — verified CV metrics as mono figures with context lines.
6. **Next / previous** case study, using the shared route transition.

Nothing on these pages is invented. Where a bullet in the CV is thin, it is
expanded only with the verified public context recorded in §2, and anything
requiring the owner's knowledge is marked `DRAFT` for review.

## 6. Performance budget & fallback matrix

| Risk | Mitigation |
|---|---|
| WebGL bundle (~150kb gz, R3F + three) blocking first paint | Both canvases dynamically imported, mounted on intersection only, never in the initial bundle |
| Shader not ready at paint | Pre-baked static gradient poster renders first, same dimensions, zero layout shift |
| Weak GPU / battery | Capability probe on mount: renderer string, `deviceMemory`, `hardwareConcurrency`. Fail → static poster permanently. DPR capped at 1.5 on `full`, 1 on `lite` (superseded 2026-09-12: phones run the shader at half the pixels rather than not at all) |
| Off-screen render cost | rAF paused via IntersectionObserver and on `visibilitychange` |
| Mobile | Hero shader **stays**, at 1x device pixels instead of 1.5x (superseded 2026-09-12: the shader was originally swapped for an animated CSS gradient mesh here, but with the drawn lattice also dropped below md the hero was left with no object and no visible motion). Gradient mesh remains the fallback before first intersection and when the palette cannot be read. 3D object **stays** but low-poly, no post-processing, drift-only with tap-to-focus. Pinned sequences unpin → stacked reveals |
| Two animation libraries | GSAP + ScrollTrigger for scroll only. CSS + View Transitions for the rest. Motion/Framer is **not installed** |
| Smooth scroll | Lenis, disabled under `prefers-reduced-motion` |
| Loader hurting repeat visits | 1.4s hard cap, skippable, session-gated |

**Budgets:** initial JS ≤ 120kb gz excluding deferred 3D. LCP ≤ 1.8s on 4G.
CLS ≤ 0.02. Lighthouse 95+ mobile / 90+ desktop.

---

## 7. Accessibility

- `prefers-reduced-motion: reduce` gets a **static composition** for each
  signature moment, not merely "animation off": shader → still frame, 3D object →
  fixed hero angle, pinned sequences → static layout.
- Full keyboard path including the 3D object (§5.4).
- Semantic landmarks, one `h1`, ordered headings, skip link.
- Visible focus ring in `signal`, 2px offset, never removed.
- Canvas content mirrored in visually-hidden text.
- Descriptive alt text on the headshot and all logos.
- Contrast verified against §3.

---

## 8. SEO

- Static generation for every route.
- Per-route title, description, canonical, OG + Twitter card.
- Designed OG image per route (generated at build, not the headshot).
- `Person` and `CreativeWork` JSON-LD.
- `sitemap.xml`, `robots.txt`.
- Semantic HTML — case studies are `<article>`, not div soup.

---

## 9. Tech stack and rationale

| Choice | Why |
|---|---|
| Next.js 15 App Router, React 19, TypeScript, fully static | It is his own stack — a portfolio claiming React/TS depth should be built in it. Route-level splitting and real SEO for case-study routes come free. |
| Tailwind v4 over CSS custom-property tokens | Tokens-first is literally his CV narrative; the site should be built the way he says he builds. |
| React Three Fiber + drei + hand-written GLSL | Required by the two 3D/shader moments. Hand-written shaders are the differentiator, not a library preset. |
| GSAP + ScrollTrigger | Better scrub and pin control than the alternatives for the pinned narrative. |
| Lenis | Small, respects reduced motion. |
| Zod + Resend, Next Route Handler | Real backend for the form. Resend's free tier sends to a verified owner address without a custom domain — exactly this use case. |
| Vercel | Best fit for the framework; free subdomain now, custom domain later. |

Deploy: `sushansunuwar.vercel.app`. No domain owned yet; swap is trivial later.

---

## 10. Contact form

- Fields: name, email, message. All required.
- Zod validation, shared schema client and server.
- Spam: honeypot field + submission-timing check + edge rate limit by IP.
- Server: Next Route Handler → Resend → koinchsushan@gmail.com.
- States: idle, submitting, success, error — all announced via `aria-live`.
- Never `mailto:`.
- **Requires a Resend API key from the owner at stage 4.**

---

## 11. Build stages

Each stage ends with an owner checkpoint.

1. **Skeleton** — routes, semantic HTML, all real CV content, no motion, no
   colour system. Owner verifies the words are right.
2. **Design system** — tokens, type scale, spacing, base components, generative
   SVG language, headshot treatment. Owner verifies it looks like something.
3. **Motion & 3D** — the three signature moments, layered one at a time, with a
   Lighthouse run after each.
4. **Wiring** — contact form, SEO/OG, sitemap, a11y audit, deploy.

---

## 12. Open items

- **Bio copy is a draft.** To be written from CV facts at stage 1 and clearly
  marked in-repo as `DRAFT — owner to rewrite`. No invented personality claims.
- **Resend API key** needed before stage 4.
- **Client logo files** — to be sourced or redrawn as monochrome SVG at stage 2.
- **Uncut Sans licence** to be confirmed at stage 2; fall back to Instrument Sans.
- **Headshot file** to be placed in `public/` at stage 2.
