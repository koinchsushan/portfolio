import { describe, it, expect } from 'vitest'
import { contactSchema } from '@/lib/contactSchema'

const goodPayload = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  message: 'A message that easily clears the twenty character minimum.',
  website: '',
  startedAt: Date.now() - 5000,
}

describe('contactSchema', () => {
  it('accepts a good payload', () => {
    const result = contactSchema.safeParse(goodPayload)
    expect(result.success).toBe(true)
  })

  it('rejects a filled honeypot', () => {
    const result = contactSchema.safeParse({ ...goodPayload, website: 'http://spam.example' })
    expect(result.success).toBe(false)
  })

  it('rejects a bad email', () => {
    const result = contactSchema.safeParse({ ...goodPayload, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('rejects a too-short message', () => {
    const result = contactSchema.safeParse({ ...goodPayload, message: 'too short' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing startedAt', () => {
    const withoutStartedAt: Record<string, unknown> = { ...goodPayload }
    delete withoutStartedAt.startedAt
    const result = contactSchema.safeParse(withoutStartedAt)
    expect(result.success).toBe(false)
  })
})
