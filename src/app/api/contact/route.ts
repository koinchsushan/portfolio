import { Resend } from 'resend'
import { contactSchema } from '@/lib/contactSchema'

// Sends real email (Resend's SDK talks to their API over fetch), so this
// route needs the Node runtime rather than the edge runtime.
export const runtime = 'nodejs'

// A human cannot type a message meeting the 20-character minimum in under
// this many milliseconds. Anything faster is treated as automated.
const MIN_SUBMIT_MS = 1500

// Small, in-memory, fixed-window limiter keyed by IP. This is intentionally
// not a durable store: it lives in the process's memory, so it resets on
// every deploy or cold start and is NOT shared across instances if this
// route is ever served from more than one. That is an acceptable trade-off
// for a single-instance personal site; swap it for a shared store (Upstash,
// Redis) before running this behind more than one instance.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const bucket = rateLimitBuckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  bucket.count += 1
  return bucket.count > RATE_LIMIT_MAX
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (!forwarded) return 'unknown'
  return forwarded.split(',')[0]?.trim() || 'unknown'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  if (isRateLimited(ip)) {
    return Response.json({ error: 'rate_limited' }, { status: 429 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return Response.json({ error: 'invalid_input', fieldErrors: {} }, { status: 400 })
  }

  // Honeypot: real visitors never see or fill this field (it is hidden from
  // sighted users and screen readers alike, see ContactForm.tsx). A filled
  // value gets exactly the response a real success would, minus the send.
  // Never confirm to an automated client that it was caught.
  if (isRecord(raw) && typeof raw.website === 'string' && raw.website.length > 0) {
    return Response.json({ ok: true }, { status: 202 })
  }

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    return Response.json(
      { error: 'invalid_input', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { name, email, message, startedAt } = parsed.data

  if (Date.now() - startedAt < MIN_SUBMIT_MS) {
    return Response.json({ error: 'too_fast' }, { status: 400 })
  }

  // The owner has not provisioned Resend yet. Fail loudly on the server,
  // clearly (but generically) to the client, and never at import time or
  // during a build, since that would break `npm run build` for everyone
  // until a key exists.
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set. The message was not sent.')
    return Response.json({ error: 'unavailable' }, { status: 503 })
  }

  const resend = new Resend(apiKey)
  const to = process.env.CONTACT_TO || 'koinchsushan@gmail.com'

  try {
    const { error } = await resend.emails.send({
      from: 'Portfolio contact form <onboarding@resend.dev>',
      to,
      replyTo: email,
      subject: `New message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    })

    if (error) {
      // Log only that the send failed, never the message body.
      console.error('[contact] Resend rejected the send:', error.name)
      return Response.json({ error: 'send_failed' }, { status: 502 })
    }
  } catch (err) {
    console.error('[contact] send threw:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'send_failed' }, { status: 502 })
  }

  return Response.json({ ok: true }, { status: 202 })
}
