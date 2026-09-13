# Sushan Sunuwar, portfolio

The personal site of Sushan Sunuwar, a Software Engineer in London working across product engineering, AI/ML and data science.

**Live:** [sushansunuwar.vercel.app](https://sushansunuwar.vercel.app/)

## The idea

Most of the work this site is about cannot be shown. The commercial engagements are enterprise B2B systems with no public interface, so there is no screenshot gallery to build, and the site does not fake one.

Instead it argues that the work is systems thinking by being a system itself. Each case study renders its real engineering problem as a diagram that builds as you read, and the site's own craft (its tokens, its motion budget, its accessibility) is the portfolio piece the client work cannot be.

Visually it is a dark instrumentation language: a warm near-black ground, a graticule of hairlines, tonal ramps, and one accent. Things on the page read like instruments taking a reading: signal resolving out of noise.

## What's on the site

| Route | What it is |
|---|---|
| `/` | Hero, headline figures, selected work, research, technical stack, trajectory, about, contact |
| `/work/[slug]` | A full case study (situation, constraint, decision, outcome) with its diagram |
| `/research` | The research studies in full |
| `/resume` | The CV as a PDF, served inline so it opens in its own tab |
| `/api/contact` | Handles the contact form and sends the message by email |

The home page and each case study generate their own Open Graph image, and the site serves `robots.txt` and `sitemap.xml`.

## Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4** over CSS custom properties
- **three.js** with **React Three Fiber** for the hero's hand-written curl-noise shader and the interactive stack object
- **GSAP ScrollTrigger** for the pinned case studies, **Lenis** for smooth scrolling
- **Zod** for validating the contact form on both client and server, **Resend** for sending it
- **Phosphor** icons, **Simple Icons** for technology marks
- **Vitest** and Testing Library for unit tests, **Playwright** with axe for accessibility

## How it's built

**Content is the single source of truth.** Every fact on the site lives in [`src/content/`](src/content), transcribed from the CV. Components import from there and never hardcode a name, date, metric or claim, so the copy can be reviewed in one place.

**Design tokens.** The whole palette is six colours in [`src/styles/tokens.css`](src/styles/tokens.css), mapped into Tailwind in [`src/app/globals.css`](src/app/globals.css). There is exactly one accent, `--signal`. Components never use a raw hex value, and a test enforces that. Type is Archivo (a variable family whose width axis carries much of the hierarchy) with Spline Sans Mono for labels, dates and figures. Motion shares one set of easing and duration tokens.

**A three-tier motion budget.** [`src/lib/useCapability.ts`](src/lib/useCapability.ts) sorts every visitor into one of three tiers:

| Tier | Who gets it | What they get |
|---|---|---|
| `full` | Capable desktop hardware | WebGL hero and stack object, pinned case studies |
| `lite` | Phones, tablets, narrow viewports | The same WebGL layers at lower resolution, no scroll pinning |
| `static` | Reduced motion, no WebGL, or low memory or cores | A complete static composition: no canvas, no pinning, diagrams fully built |

`prefers-reduced-motion` always lands on `static`, and that tier is designed as a finished page rather than a page with animation switched off. No text on the site depends on animation to be readable: every reveal renders complete on the server and without JavaScript.

**Heavy code loads only when it's needed.** three.js, GSAP and the stack object's icons are split out of the initial bundle and load only as their section approaches.

**Accessibility** targets WCAG 2.1 AA. Every route is scanned with axe in a real browser, keyboard navigation is tested, and the 3D stack object has a full set of focusable controls alongside it, so nothing it shows is visual-only.

## Running it locally

Requires Node.js (developed on v24) and npm.

```bash
npm install
```

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment

The site builds and runs with no environment variables at all. Only the contact form's email send needs them.

```bash
cp .env.local.example .env.local
```

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | A [Resend](https://resend.com/api-keys) API key. Without it, `POST /api/contact` returns `503` and sends nothing. |
| `CONTACT_TO` | Where submitted messages are delivered. Defaults to the site owner's address. |

The contact route also rate-limits by IP, rejects submissions made faster than a person could type them, and quietly discards anything that fills the hidden honeypot field.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests, once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:a11y` | Playwright and axe against a fresh production build, which it builds and serves itself on port 4310 |

## Tests

The unit suite covers content integrity (the verified figures, the right number of studies and roles), the contact schema and route, capability detection, and rendering of the home page and every case study page. It also enforces house rules that are easy to break by accident:

- no raw hex colours in any component
- no em dashes or en dashes in any source file
- no phone number rendered anywhere
- a confidentiality guard that scans the repo for forbidden terms by SHA-256, so the terms themselves never appear in this public repository
- the count-up animation always lands on the exact figure from the content

The accessibility suite checks every route for WCAG 2.1 AA violations, checks keyboard focus, and confirms that reduced motion gives a complete static page with no canvas and no pinning.

## Project structure

```
src/
  app/            routes, layout, API, OG images, robots, sitemap, favicons
  components/
    sections/     the home page sections, in page order
    case-study/   the /work/[slug] template
    graphics/     SVG diagrams, the trajectory axis, static stand-ins for the 3D
    three/        the WebGL hero shader and the stack object
    motion/       pinning, smooth scroll, in-page navigation, reveals
    primitives/   links, figures, headers and other small building blocks
    layout/       nav, footer, skip link
  content/        every fact on the site, and the only place facts live
  lib/            capability tiers, reveal hooks, scrolling, schemas
  styles/         design tokens
tests/            unit, content, guard and accessibility tests
docs/
  superpowers/    the original design spec and build plan
  brand/          the monogram source
public/           the CV PDF and the portrait
```

## Deployment

Hosted on [Vercel](https://vercel.com). Every push to `main` deploys to production automatically. Set `RESEND_API_KEY` (and optionally `CONTACT_TO`) in the Vercel project's environment variables to enable the contact form.

## Design documents

- [Design spec](docs/superpowers/specs/2026-09-07-portfolio-design.md): the goal, content rules, visual system and risk table
- [Build plan](docs/superpowers/plans/2026-09-07-portfolio-site.md): how the site was put together

> **Note for contributors and AI agents:** this project runs a newer Next.js than most training data describes. Read [`AGENTS.md`](AGENTS.md) and the guides in `node_modules/next/dist/docs/` before writing Next.js-specific code.
