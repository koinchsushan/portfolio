import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
const css = readFileSync('src/styles/tokens.css', 'utf8')

describe('design tokens', () => {
  it('defines the six palette tokens with the exact spec values', () => {
    for (const [n, hex] of Object.entries({
      ground: '#100E0C', panel: '#1E1A15', grid: '#3A332C', label: '#A79F96',
      bone: '#EDEAE9', signal: '#E3B23C',
    })) expect(css).toMatch(new RegExp(`--${n}:\\s*${hex}`, 'i'))
  })
  it('carries exactly one accent colour, never a second (depth) token', () => {
    expect(css).not.toMatch(/--depth\s*:/i)
    expect(css).not.toMatch(/#2a7b8c/i)
  })
  it('uses neither pure white nor pure black', () => {
    expect(css).not.toMatch(/#fff\b|#ffffff|#000\b|#000000/i)
  })
  it('defines the full fluid type scale', () => {
    for (const s of [12,14,16,18,22,28,40,64,104,160]) expect(css).toContain(`--fs-${s}:`)
  })
})
