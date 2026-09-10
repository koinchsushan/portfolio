import { z } from 'zod'

/**
 * One schema, shared by the client form and the route handler. Every
 * message here is copy a real visitor might read, so it says what is wrong
 * and how to fix it rather than "invalid input".
 *
 * `website` is a honeypot: a field no real visitor sees or fills, wired
 * into the schema so a filled value fails validation the same way any
 * other bad input would. The route handler intercepts a filled honeypot
 * before this schema ever runs (see `src/app/api/contact/route.ts`), so
 * the schema's own rejection of it here mostly exists as a second line of
 * defence and to keep the type honest.
 *
 * `startedAt` is the epoch millisecond the form was first focused, set by
 * the client. The route compares it against the time of submission: a
 * message meeting the 20-character minimum below cannot plausibly be
 * typed in under 1500ms, so a submission that fast is treated as
 * automated, never as a slow typist.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Add your name, at least 2 characters.')
    .max(80, 'Keep the name under 80 characters.'),
  email: z.email('Enter an email address so I can reply.'),
  message: z
    .string()
    .trim()
    .min(20, 'Write at least 20 characters, enough for me to act on.')
    .max(2000, 'Keep the message under 2000 characters.'),
  website: z.string().max(0, 'Leave this field empty.'),
  startedAt: z
    .number('Reload the page and try again.')
    .int('Reload the page and try again.')
    .positive('Reload the page and try again.'),
})

export type ContactInput = z.infer<typeof contactSchema>

/** The three fields a person can see and fix. `website` and `startedAt` are never surfaced in the UI. */
export type ContactFieldName = 'name' | 'email' | 'message'

export type ContactFieldErrors = Partial<Record<ContactFieldName, string>>
