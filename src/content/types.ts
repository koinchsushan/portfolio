/**
 * Shared types for the content module. This module is the single typed
 * source of truth for every fact rendered on the site , see
 * docs/superpowers/specs/2026-09-07-portfolio-design.md §2.
 */

/** A single verified figure with its label, e.g. { value: '450,000+', label: 'union members' }. */
export type Metric = { value: string; label: string }

/** The three generative diagrams used across the home page and case study routes. */
export type DiagramId = 'converge' | 'split' | 'extract'

/** An outbound link attached to a piece of content. */
export type Link = { label: string; href: string }

export interface Identity {
  name: string
  /** Used alone as the hero's lead-in. The full name lives in the nav and the
   *  document title, so the display type does not have to carry it. */
  firstName: string
  /** The hero's display line. A claim about the work, not a job description. */
  tagline: string
  title: string
  strapline: string
  location: string
  email: string
  linkedin: string
  github: string
  availability: string
}

export interface CaseStudy {
  slug: string
  index: string
  client: string
  employer: string
  role: string
  dates: string
  stack: string[]
  /** 2-3 short paragraphs: what existed, who it served, what was breaking. */
  situation: string[]
  /** One sentence naming what made the obvious solution unavailable. */
  constraint: string
  /** The engineering judgement, one or more paragraphs. */
  decision: string[]
  outcomes: Metric[]
  links: Link[]
  diagram: DiagramId
}

export interface ResearchItem {
  title: string
  repo: string
  blurb: string
  /** A shorter version of `blurb` for the home page's research tiles, which
   *  sit beside the flagship study in a fixed grid. The full `blurb` still
   *  reads on /research. Falls back to `blurb` when absent. */
  summary?: string
  year?: string
  stack?: string[]
  licence?: string
  forks?: number
  liveDemo?: boolean
  /** True when this field's copy goes beyond what spec §2 states verbatim
   * and needs the owner's confirmation before publishing. */
  draft?: boolean
}

export interface Role {
  org: string
  location?: string
  title: string
  dates: string
  stack: string[]
  bullets: string[]
  /** Title progression within the same org, oldest first. */
  progression?: string[]
  /** Verified public context about the org/client, used to sharpen the story. */
  context?: string
}

export interface Education {
  institution: string
  location?: string
  award: string
  dates: string
  modules?: string[]
  project?: string
}

export interface SkillGroup {
  label: string
  skills: string[]
  /** True when the item list is a best-effort synthesis rather than a
   * verbatim transcription of the CV's own groupings , see report. */
  draft?: boolean
}

export interface Bio {
  /** The About narrative, in career order. Rendered as one paragraph each. */
  paragraphs: string[]
  /** The line the five paragraphs earn, set apart and larger. One sentence
   *  pair, never a restatement of `identity.tagline`. */
  pull: string
}
