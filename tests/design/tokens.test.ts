import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
const css = readFileSync('src/styles/tokens.css', 'utf8')

describe('design tokens', () => {
  it('defines the seven palette tokens with the exact spec values', () => {
    for (const [n, hex] of Object.entries({
      ground: '#0B1015', panel: '#131B22', grid: '#22303A', label: '#8A9BA8',
      bone: '#E9E7E2', signal: '#E3B23C', depth: '#2A7B8C',
    })) expect(css).toMatch(new RegExp(`--${n}:\\s*${hex}`, 'i'))
  })
  it('uses neither pure white nor pure black', () => {
    expect(css).not.toMatch(/#fff\b|#ffffff|#000\b|#000000/i)
  })
  it('defines the full fluid type scale', () => {
    for (const s of [12,14,16,18,22,28,40,64,104,160]) expect(css).toContain(`--fs-${s}:`)
  })
})
