import { hueAt, type Color, type Hue, type Pick } from '../color'
import {
  dragTurn,
  moveGesture,
  startGesture,
  type Gesture,
  type Landing,
  type Pointer,
} from './gesture'
import { coast, flickVelocity } from './inertia'

/**
 * The hue in motion, in one place. Every input previews through these states
 * and leaves them by committing once, so history records only choices. A
 * new input always replaces whatever was moving: a key, a click or a pick
 * catches a coasting wheel by construction.
 */
export type Motion =
  | { readonly kind: 'idle' }
  /** A key held down, or the ring being dragged. */
  | { readonly kind: 'held'; readonly hue: Hue }
  /** Mouse-wheel notches, waiting for a pause. */
  | { readonly kind: 'scrolling'; readonly hue: Hue }
  /** A finger on the phone wheel. `at` is the wheel's free rotation in degrees. */
  | { readonly at: number; readonly gesture: Gesture; readonly kind: 'turning' }
  /** The phone wheel spinning on after a flick. */
  | {
      readonly at: number
      readonly kind: 'coasting'
      readonly velocity: number
    }
  /** Committed, and holding the hue on screen until the URL catches up. */
  | { readonly hue: Hue; readonly kind: 'landing' }

export type MotionEvent =
  /** The ring pointed at a hue, or Home or End. */
  | { readonly hue: Hue; readonly type: 'aim' }
  /** An arrow or page key, stepping from the hue on show. */
  | { readonly by: number; readonly type: 'nudge' }
  /** A key came up, focus left, or the ring lost its pointer. */
  | { readonly type: 'letGo' }
  | { readonly by: number; readonly type: 'scroll' }
  | { readonly type: 'pause' }
  /** − or +: one deliberate step, committed straight away. */
  | { readonly by: number; readonly type: 'step' }
  /** A square picked in the grid, or the pick cleared. */
  | { readonly pick: Pick | null; readonly type: 'choose' }
  /** A whole colour at once, from an agent, committed straight away. */
  | { readonly hue: Hue; readonly pick: Pick | null; readonly type: 'jump' }
  | (Landing & { readonly turn: number; readonly type: 'press' })
  | (Pointer & { readonly type: 'move' })
  | (Pointer & {
      readonly reduced: boolean
      readonly tapAngle: number
      readonly type: 'release'
    })
  | { readonly pointerId: number; readonly type: 'cancel' }
  | { readonly elapsed: number; readonly type: 'frame' }
  /** Back, Forward or a jump through history. */
  | { readonly type: 'traverse' }
  | { readonly hue: Hue; readonly type: 'landed' }

/** A choice for the URL. `pick` is left out when only the hue changes. */
export type Commit = {
  readonly announce: boolean
  readonly hue: Hue
  readonly pick?: Pick | null
}

export type Transition = { readonly commit?: Commit; readonly motion: Motion }

/**
 * The colour `commit` takes the link to, or null when the link already holds
 * it. A hue-only commit keeps the link's pick.
 */
export function destination(commit: Commit, link: Color): Color | null {
  if (commit.pick === undefined) {
    return commit.hue === link.hue ? null : { hue: commit.hue, pick: link.pick }
  }

  return { hue: commit.hue, pick: commit.pick }
}

export const IDLE: Motion = { kind: 'idle' }

const AUTONOMOUS = new Set<Motion['kind']>(['coasting', 'landing', 'scrolling'])

/** What the page shows: the hue in motion, or the URL's when nothing moves. */
export function shownHue(motion: Motion, url: Hue): Hue {
  switch (motion.kind) {
    case 'idle':
      return url
    case 'held':
    case 'landing':
    case 'scrolling':
      return motion.hue
    default:
      return hueAt(motion.at)
  }
}

/** The phone wheel's own rotation while a finger or momentum moves it, else null. */
export function freeTurn(motion: Motion): number | null {
  if (motion.kind === 'coasting') {
    return motion.at
  }

  const turning =
    motion.kind === 'turning' &&
    motion.gesture.dragging &&
    !motion.gesture.fromEdge

  return turning ? motion.at : null
}

/**
 * The next state after `event`, and the choice to commit, if any. `shown` is
 * the hue on screen, which inputs step from when nothing is moving.
 */
export function transition(
  motion: Motion,
  event: MotionEvent,
  shown: Hue,
): Transition {
  const from = shownHue(motion, shown)

  switch (event.type) {
    case 'aim':
      return { motion: { hue: event.hue, kind: 'held' } }
    case 'nudge':
      return { motion: { hue: hueAt(from + event.by), kind: 'held' } }
    case 'scroll':
      return { motion: { hue: hueAt(from + event.by), kind: 'scrolling' } }
    case 'letGo':
      return motion.kind === 'held' ? land(motion.hue) : { motion }
    case 'pause':
      return motion.kind === 'scrolling' ? land(motion.hue) : { motion }
    default:
      return choiceTransition(motion, event, from)
  }
}

/** The inputs that are a choice the moment they arrive. */
function choiceTransition(
  motion: Motion,
  event: MotionEvent,
  from: Hue,
): Transition {
  switch (event.type) {
    case 'step':
      return land(hueAt(from + event.by), { announce: true })
    case 'choose':
      return land(from, { announce: true, pick: event.pick })
    case 'jump':
      return land(event.hue, { announce: true, pick: event.pick })
    default:
      return wheelTransition(motion, event)
  }
}

function wheelTransition(motion: Motion, event: MotionEvent): Transition {
  switch (event.type) {
    case 'press':
      return { motion: press(motion, event) }
    case 'move':
      return { motion: move(motion, event) }
    case 'release':
      return release(motion, event)
    case 'cancel':
      return ownGesture(motion, event.pointerId)
        ? land(hueAt(motion.at), { announce: motion.gesture.dragging })
        : { motion }
    case 'frame':
      return coastFrame(motion, event.elapsed)
    default:
      return { motion: settleHistory(motion, event) }
  }
}

function land(hue: Hue, commit: Partial<Commit> = {}): Transition {
  return {
    commit: { announce: false, hue, ...commit },
    motion: { hue, kind: 'landing' },
  }
}

function settleHistory(motion: Motion, event: MotionEvent): Motion {
  if (event.type === 'traverse') {
    return AUTONOMOUS.has(motion.kind) ? IDLE : motion
  }

  const landed =
    event.type === 'landed' &&
    motion.kind === 'landing' &&
    motion.hue === event.hue

  return landed ? IDLE : motion
}

function ownGesture(
  motion: Motion,
  pointerId: number,
): motion is Extract<Motion, { kind: 'turning' }> {
  return motion.kind === 'turning' && motion.gesture.pointerId === pointerId
}

function press(
  motion: Motion,
  event: Extract<MotionEvent, { type: 'press' }>,
): Motion {
  if (motion.kind === 'turning') {
    return motion
  }

  const caught = motion.kind === 'coasting'
  const startAt = caught ? motion.at : event.turn

  return {
    at: startAt,
    gesture: startGesture(event, startAt, caught),
    kind: 'turning',
  }
}

function move(
  motion: Motion,
  event: Extract<MotionEvent, { type: 'move' }>,
): Motion {
  if (!ownGesture(motion, event.pointerId)) {
    return motion
  }

  const gesture = moveGesture(motion.gesture, event)
  const turns = gesture.dragging && !gesture.fromEdge

  return {
    at: turns ? dragTurn(gesture, event.x) : motion.at,
    gesture,
    kind: 'turning',
  }
}

function release(
  motion: Motion,
  event: Extract<MotionEvent, { type: 'release' }>,
): Transition {
  if (!ownGesture(motion, event.pointerId)) {
    return { motion }
  }

  const { gesture } = motion

  if (!gesture.dragging) {
    return land(hueAt(motion.at + event.tapAngle), { announce: true })
  }

  if (gesture.fromEdge) {
    return land(hueAt(motion.at), { announce: true })
  }

  const at = dragTurn(gesture, event.x)

  const velocity = event.reduced
    ? null
    : flickVelocity(gesture.samples, event.time, gesture.radius)

  return velocity === null
    ? land(hueAt(at), { announce: true })
    : { motion: { at, kind: 'coasting', velocity } }
}

function coastFrame(motion: Motion, elapsed: number): Transition {
  if (motion.kind !== 'coasting') {
    return { motion }
  }

  const next = coast({ turn: motion.at, velocity: motion.velocity }, elapsed)

  return next === null
    ? land(hueAt(motion.at), { announce: true })
    : { motion: { at: next.turn, kind: 'coasting', velocity: next.velocity } }
}
