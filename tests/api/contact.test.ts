import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const sendMock = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock }
  },
}))

const { POST } = await import('@/app/api/contact/route')

function postContact(ip: string, body: Record<string, unknown>) {
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    }),
  )
}

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'A message that easily clears the twenty character minimum.',
    website: '',
    startedAt: Date.now() - 5000,
    ...overrides,
  }
}

describe('POST /api/contact', () => {
  const originalKey = process.env.RESEND_API_KEY

  beforeEach(() => {
    sendMock.mockReset()
    sendMock.mockResolvedValue({ data: { id: 'email_test' }, error: null })
    process.env.RESEND_API_KEY = 'test_key'
  })

  afterEach(() => {
    process.env.RESEND_API_KEY = originalKey
  })

  it('sends exactly once and returns 202 on a valid payload', async () => {
    const res = await postContact('203.0.113.1', validPayload())
    expect(res.status).toBe(202)
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  it('returns 400 and sends nothing on an invalid payload', async () => {
    const res = await postContact('203.0.113.2', validPayload({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('returns 202 and sends nothing when the honeypot is filled', async () => {
    const res = await postContact('203.0.113.3', validPayload({ website: 'http://spam.example' }))
    expect(res.status).toBe(202)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('returns 400 and sends nothing when submitted under 1500ms', async () => {
    const res = await postContact('203.0.113.4', validPayload({ startedAt: Date.now() }))
    expect(res.status).toBe(400)
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('returns 429 after the per-IP limit is exceeded', async () => {
    const ip = '203.0.113.5'
    let lastStatus = 0
    for (let i = 0; i < 6; i += 1) {
      const res = await postContact(ip, validPayload())
      lastStatus = res.status
    }
    expect(lastStatus).toBe(429)
  })

  it('returns 503 and sends nothing when RESEND_API_KEY is absent', async () => {
    delete process.env.RESEND_API_KEY
    const res = await postContact('203.0.113.6', validPayload())
    expect(res.status).toBe(503)
    expect(sendMock).not.toHaveBeenCalled()
  })
})
