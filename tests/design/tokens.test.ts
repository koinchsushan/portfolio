import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
const css = readFileSync('src/styles/tokens.css', 'utf8')

describe('design tokens', () => {
  it('defines the six palette tokens with the exact spec values', () => {
    for (const [n, hex] of Object.entries({
      paper: '#F2F3F1', surface: '#FBFBFA', rule: '#DCDDD9',
      // muted is darkened two steps from the #6C7075 spec value (4.48:1 on
      // paper, just under the 4.5:1 AA floor) to #6A6E73 (4.61:1), reported
      // in task-N-report.md.
      muted: '#6A6E73',
      ink: '#16171B', signal: '#2A4DD0',
    })) expect(css).toMatch(new RegExp(`--${n}:\\s*${hex}`, 'i'))
  })
  it('carries exactly one accent colour, never a second (depth) token', () => {
    expect(css).not.toMatch(/--accent2\s*:|--depth\s*:|--secondary\s*:/i)
    expect(css).not.toMatch(/#2a7b8c/i)
  })
  it('never drifts the paper warm (cream/brass/terracotta/oxblood/ochre banned) or the accent off cobalt', () => {
    // taste-skill 4.2: no #f5f1ea / #faf7f1 / #efeae0 warm-cream family, and
    // the paper stays a cool neutral rather than sliding red-heavy (warm)
    // the way a cream or brass paper would: red should never meaningfully
    // outrun blue.
    expect(css).not.toMatch(/#f5f1ea|#faf7f1|#efeae0/i)
    const paperMatch = css.match(/--paper:\s*#([0-9a-f]{6})/i)
    expect(paperMatch).not.toBeNull()
    const hex = paperMatch![1]
    const [r, , b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16))
    expect(r - b).toBeLessThan(5)
  })
  it('uses neither pure white nor pure black', () => {
    expect(css).not.toMatch(/#fff\b|#ffffff|#000\b|#000000/i)
  })
  it('defines the full fluid type scale', () => {
    for (const s of [12,14,16,18,22,28,40,64,104,160]) expect(css).toContain(`--fs-${s}:`)
  })
  it('brings the top of the type scale down from 160px', () => {
    const match = css.match(/--fs-160:\s*clamp\([^,]+,[^,]+,\s*([\d.]+)rem\)/i)
    expect(match).not.toBeNull()
    expect(parseFloat(match![1]) * 16).toBeLessThan(160)
  })
})
