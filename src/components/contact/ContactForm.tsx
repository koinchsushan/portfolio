'use client'

import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { identity } from '@/content'
import { contactSchema, type ContactFieldErrors } from '@/lib/contactSchema'

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; name: string; email: string }
  | { kind: 'error'; message: string }

const EMPTY_FIELDS = { name: '', email: '', message: '' }
const MESSAGE_MAX = 2000

const inputClass =
  'w-full rounded-[var(--radius)] border border-grid bg-panel px-4 py-3 text-16 text-bone placeholder:text-label transition-colors duration-150 disabled:opacity-50 aria-invalid:border-2 aria-invalid:border-bone'

/**
 * One field: mono label above the control, optional helper text, error
 * text below the control. Helper text stays in the markup even once an
 * error appears, it is never swapped out, only supplemented.
 */
function Field({
  id,
  label,
  helper,
  error,
  children,
}: {
  id: string
  label: string
  helper?: string
  error?: string
  children: ReactNode
}) {
  // `group-has-[:focus]` rather than `peer-focus`: the label precedes its
  // control, and a peer variant can only look forwards. The label brightening
  // is the one bit of feedback that survives a phone keyboard covering the
  // rest of the form.
  return (
    <div className="group flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-12 uppercase tracking-[0.14em] text-label transition-colors duration-[var(--dur-hover)] group-has-[:focus]:text-bone"
      >
        {label}
      </label>
      {children}
      {helper && (
        <p id={`${id}-helper`} className="font-mono text-12 leading-relaxed text-label">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="flex items-baseline gap-1.5 font-mono text-12 font-medium text-bone">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

function SuccessPanel({ name, onReset }: { name: string; onReset: () => void }) {
  return (
    <div className="disclose-item flex flex-col gap-4 border-l-2 border-signal py-1 pl-5">
      <p className="font-mono text-12 uppercase tracking-[0.14em] text-signal">Message sent</p>
      <p className="max-w-[42ch] text-16 leading-relaxed text-bone">
        Thanks{name ? `, ${name}` : ''}. I read every message myself and will reply from this address.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="press self-start font-mono text-14 text-label underline decoration-grid decoration-1 underline-offset-4 transition-colors duration-[var(--dur-hover)] hover:text-bone hover:decoration-bone"
      >
        Send another message
      </button>
    </div>
  )
}

/**
 * The contact section's form. Composes with the surrounding section rather
 * than sitting inside a card of its own: mono field labels, hairline rules,
 * a panel plane only under the controls that need one (the inputs), and
 * the section's one accent reserved for the submit button and the moment
 * the message resolves into "sent".
 *
 * State machine: idle -> (client validation fails) -> idle with
 * fieldErrors -> submitting -> success, or submitting -> idle with a
 * server-level error message (rate limited, no API key configured, send
 * failed, or the anti-bot timing check). A single sr-only aria-live region
 * announces every transition; the visible UI (inline errors, the success
 * panel, the disabled button) carries the same information for sighted
 * users without needing a second live region.
 */
export function ContactForm() {
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const websiteId = useId()

  const [fields, setFields] = useState(EMPTY_FIELDS)
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  // When the form was first focused, the anti-bot timing signal. Falls
  // back to mount time if submitted without ever registering a focus
  // event, so the field the server requires is always a real number.
  // `useState`'s lazy initializer is the one place a one-time impure read
  // like `Date.now()` is safe to make during render.
  const [mountedAt] = useState(() => Date.now())
  const startedAtRef = useRef<number | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  function markStarted() {
    if (startedAtRef.current === null) startedAtRef.current = Date.now()
  }

  function updateField(key: keyof typeof EMPTY_FIELDS, value: string) {
    setFields((f) => ({ ...f, [key]: value }))
    setFieldErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status.kind === 'submitting') return

    const payload = {
      name: fields.name,
      email: fields.email,
      message: fields.message,
      website: honeypotRef.current?.value ?? '',
      startedAt: startedAtRef.current ?? mountedAt,
    }

    const parsed = contactSchema.safeParse(payload)
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setFieldErrors({
        name: flat.name?.[0],
        email: flat.email?.[0],
        message: flat.message?.[0],
      })
      setStatus({ kind: 'idle' })
      return
    }

    setFieldErrors({})
    setStatus({ kind: 'submitting' })

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })

      if (res.status === 202) {
        setStatus({ kind: 'success', name: parsed.data.name, email: parsed.data.email })
        setFields(EMPTY_FIELDS)
        startedAtRef.current = null
        return
      }

      if (res.status === 400) {
        const body = (await res.json().catch(() => null)) as { error?: string; fieldErrors?: ContactFieldErrors } | null
        if (body?.error === 'invalid_input' && body.fieldErrors) {
          setFieldErrors(body.fieldErrors)
          setStatus({ kind: 'idle' })
          return
        }
        setStatus({
          kind: 'error',
          message: 'That went out faster than a message this size takes to write. Wait a moment and try again.',
        })
        return
      }

      if (res.status === 429) {
        setStatus({
          kind: 'error',
          message: 'Too many messages from this connection. Wait a few minutes and try again.',
        })
        return
      }

      if (res.status === 503) {
        setStatus({
          kind: 'error',
          message: `Email delivery is not wired up yet. Reach me directly at ${identity.email} instead.`,
        })
        return
      }

      setStatus({
        kind: 'error',
        message: `That did not go through. Email me directly at ${identity.email}, or try again in a moment.`,
      })
    } catch {
      setStatus({
        kind: 'error',
        message: `That did not go through. Check your connection, or email ${identity.email} directly.`,
      })
    }
  }

  const isSubmitting = status.kind === 'submitting'
  const isSuccess = status.kind === 'success'

  const liveMessage = status.kind === 'success'
    ? `Message sent. I will reply to ${status.email} soon.`
    : isSubmitting
      ? 'Sending message.'
      : status.kind === 'error'
        ? status.message
        : Object.values(fieldErrors).some(Boolean)
          ? 'Fix the highlighted fields before sending.'
          : ''

  return (
    <div>
      {/* The one aria-live region for the whole flow. Persistent for the
          lifetime of the component (never unmounted), sr-only, and always
          the sole carrier of state announcements, visible feedback below
          is for sighted users and does not duplicate the role. */}
      <p aria-live="polite" role="status" className="sr-only">
        {liveMessage}
      </p>

      {isSuccess ? (
        <SuccessPanel name={status.name} onReset={() => setStatus({ kind: 'idle' })} />
      ) : (
        <form noValidate onFocus={markStarted} onSubmit={handleSubmit} className="flex flex-col gap-6">
          <p className="font-mono text-12 uppercase tracking-[0.14em] text-label">Send a message</p>

          <Field id={nameId} label="Name" error={fieldErrors.name}>
            <input
              id={nameId}
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              maxLength={80}
              required
              value={fields.name}
              onChange={(e) => updateField('name', e.target.value)}
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? `${nameId}-error` : undefined}
              disabled={isSubmitting}
              className={inputClass}
            />
          </Field>

          <Field
            id={emailId}
            label="Email"
            helper="Only used to reply, never shared or stored beyond that."
            error={fieldErrors.email}
          >
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ada@example.com"
              required
              value={fields.email}
              onChange={(e) => updateField('email', e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={[`${emailId}-helper`, fieldErrors.email ? `${emailId}-error` : null]
                .filter(Boolean)
                .join(' ')}
              disabled={isSubmitting}
              className={inputClass}
            />
          </Field>

          <Field
            id={messageId}
            label="Message"
            helper="What you're building, and where I'd fit. 20 characters minimum."
            error={fieldErrors.message}
          >
            <textarea
              id={messageId}
              name="message"
              rows={5}
              placeholder="e.g. We're rebuilding onboarding and need someone to own the frontend."
              maxLength={MESSAGE_MAX}
              required
              value={fields.message}
              onChange={(e) => updateField('message', e.target.value)}
              aria-invalid={Boolean(fieldErrors.message)}
              aria-describedby={[`${messageId}-helper`, fieldErrors.message ? `${messageId}-error` : null]
                .filter(Boolean)
                .join(' ')}
              disabled={isSubmitting}
              className={`${inputClass} resize-y`}
            />
            <p className="-mt-1 self-end font-mono text-12 tabular-nums text-label" aria-hidden="true">
              {fields.message.length} / {MESSAGE_MAX}
            </p>
          </Field>

          {/* Honeypot. Invisible to sighted users (positioned off-screen, not
              display:none) and removed from the accessibility tree and the
              tab order, three separate defences rather than one. A real
              visitor can never see it, focus it, or fill it. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor={websiteId}>Leave this field blank</label>
            <input
              ref={honeypotRef}
              id={websiteId}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="whitespace-nowrap rounded-[var(--radius)] bg-signal px-6 py-3 font-mono text-14 text-ground transition-[translate,scale,filter] duration-[var(--dur-tap)] ease-[var(--ease-resolve)] hover:-translate-y-px hover:brightness-110 active:translate-y-px active:scale-[0.98] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:active:scale-100"
            >
              {isSubmitting ? 'Sending' : 'Send message'}
            </button>

            {status.kind === 'error' && (
              <p className="flex items-baseline gap-1.5 font-mono text-12 font-medium text-bone">
                <span aria-hidden="true">!</span>
                <span>{status.message}</span>
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
