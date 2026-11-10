import { hueAt, type Hue, type Pick } from '../../color'
import {
  nextLink,
  shownHue,
  transition,
  type Commit,
  type Motion,
  type MotionEvent,
} from '../motion'

/**
 * The dial's motion machine inside a model of the page around it, for the
 * exhaustive check in motion.verify.ts. `transition` is the real one;
 * the rest stands in for code that a reviewer can open:
 *
 * - `send` and `deliver` follow createDialMotion's send and its landing in the
 *   link. Where a commit goes is the real `nextLink`.
 * - `deliver` pushes `entries` at once, as TanStack's commitLocation does.
 * - `frame` and `pause` are only offered when createClocks would fire them.
 * - `load` is the router finishing its latest load: useParams catches up to
 *   the newest entry, and every pending navigate() resolves, newest first.
 * - `back` is a history traverse: the browser drops the newest entry.
 */
export type World = {
  readonly motion: Motion
  /** What useParams returns. */
  readonly url: Location
  /** The browser's history, newest last. */
  readonly entries: ReadonlyArray<Location>
  /** navigate() calls whose promise hasn't resolved, oldest first. */
  readonly pending: ReadonlyArray<Hue>
  readonly loading: boolean
  readonly keyDown: boolean
  readonly fingers: ReadonlyArray<number>
  readonly gestureMs: number
  readonly fingerX: number
  /** Ghost: a coast or a scroll is running that its own input started. */
  readonly ownedRun: boolean
  /** Ghost: the hue last committed, until the next input or Back. */
  readonly holding: Hue | null
}

export type Location = { readonly hue: Hue; readonly pick: Pick | null }

const OPENED: Location = { hue: hueAt(200), pick: null }

export const START: World = {
  entries: [{ hue: hueAt(150), pick: null }, OPENED],
  fingerX: 200,
  fingers: [],
  gestureMs: 0,
  holding: null,
  keyDown: false,
  motion: { kind: 'idle' },
  ownedRun: false,
  loading: false,
  pending: [],
  url: OPENED,
}

/** One call into the real `transition`, and what it committed. */
export type Sent = {
  readonly before: Motion
  readonly commit: Commit | undefined
  readonly event: MotionEvent
}

export type Action = {
  readonly label: string
  readonly by: 'person' | 'page'
  readonly run: (world: World, sent: Array<Sent>) => World
}

export function send(world: World, event: MotionEvent, sent: Array<Sent>) {
  const next = transition(
    world.motion,
    event,
    shownHue(world.motion, world.url.hue),
  )

  sent.push({ before: world.motion, commit: next.commit, event })

  const moved = { ...world, motion: next.motion }

  return next.commit ? deliver(moved, next.commit, sent) : moved
}

function deliver(world: World, commit: Commit, sent: Array<Sent>): World {
  const next = nextLink(commit, world.url)

  if (next === null) {
    return send(world, { hue: commit.hue, type: 'landed' }, sent)
  }

  const latest = world.entries.at(-1)
  const same = JSON.stringify(latest) === JSON.stringify(next)

  return {
    ...world,
    entries: same ? world.entries : [...world.entries, next],
    loading: true,
    pending: [...world.pending, commit.hue],
  }
}
