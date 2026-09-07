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
