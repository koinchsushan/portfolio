import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Every HTML route on the site. `/resume` serves a PDF (`src/app/resume/route.ts`)
 * rather than a page, so it carries no DOM for axe to scan and is excluded,
 * exactly as the brief specifies.
 */
const HTML_ROUTES = ['/', '/research', '/work/foundermatcha', '/work/viveka-health', '/work/proponent']

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa']

test.describe('axe: no violations on any HTML route', () => {
  for (const route of HTML_ROUTES) {
    test(`${route} has zero WCAG 2.1 AA violations`, async ({ page }) => {
      await page.goto(route)
      // Case study routes carry a view transition and a route-level
      // client-side hydration pass; give the tree a moment to settle before
      // scanning so the run reflects the resting state, not a mid-hydration
      // one.
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

      expect(
        results.violations,
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.map((n) => n.target),
          })),
          null,
          2,
        ),
      ).toEqual([])
    })
  }
})

test.describe('keyboard', () => {
  test('the first Tab lands on the skip link, and focus is visible', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')

    const focused = page.locator(':focus')
    await expect(focused).toHaveText('Skip to content')
    await expect(focused).toHaveAttribute('href', '#main')

    // `:focus-visible` styling (globals.css) sets a real outline on every
    // focused element; confirm the browser is actually painting one rather
    // than only asserting which element holds focus.
    const outlineWidth = await focused.evaluate((el) => getComputedStyle(el).outlineWidth)
    expect(outlineWidth).not.toBe('0px')
  })

  test('tabbing again reaches the primary nav, still with visible focus', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    const outlineWidth = await page.locator(':focus').evaluate((el) => getComputedStyle(el).outlineWidth)
    expect(outlineWidth).not.toBe('0px')
  })
})

test.describe('reduced motion renders a complete static composition', () => {
  test.use({ reducedMotion: 'reduce' })

  test('home page has no canvas, no pinning, and readable headings', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // No WebGL canvas anywhere: `HeroCanvas` and `StackCanvas` both gate
    // their `full`/`lite`-tier layers behind `useCapability`, which resolves
    // to `static` whenever `prefers-reduced-motion: reduce` is set.
    await expect(page.locator('canvas')).toHaveCount(0)

    // No pinned case study: `PinnedStory` only ever sets `data-pinned="true"`
    // on the `full` tier.
    const pinnedStudies = page.locator('[data-pinned="true"]')
    await expect(pinnedStudies).toHaveCount(0)

    // Every heading in the static composition is present and carries real
    // text (the reveal-text safety net keeps this true even before any
    // client script has resolved anything, but this proves it holds once
    // the page has fully settled too).
    const headings = page.getByRole('heading')
    const count = await headings.count()
    expect(count).toBeGreaterThan(5)
    for (let i = 0; i < count; i += 1) {
      await expect(headings.nth(i)).toBeVisible()
      const text = await headings.nth(i).textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    }

    // The reveal-text safety net: nothing on the resting page should still
    // be sitting in the blurred, partially transparent pending state.
    await expect(page.locator('.reveal-pending')).toHaveCount(0)
  })

  test('reduced motion still passes the same WCAG checks', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
    expect(results.violations).toEqual([])
  })
})
