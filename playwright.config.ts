import { defineConfig } from '@playwright/test'

/**
 * A separate harness from the Vitest suite (`vitest.config.mts`), by
 * design: axe needs a real rendered DOM in a real browser, which jsdom
 * cannot give it. This runs against a production build (`next build` then
 * `next start`), the same artifact the bundle measurement in
 * `task-R-report.md` was taken against, so an accessibility finding here
 * reflects what actually ships, not a dev-mode approximation of it.
 */
export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4310',
  },
  webServer: {
    command: 'npm run build && npm run start -- -p 4310',
    url: 'http://localhost:4310',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
