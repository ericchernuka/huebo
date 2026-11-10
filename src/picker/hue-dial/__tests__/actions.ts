import { hueAt } from '../../color'
import { shownHue, type MotionEvent } from '../motion'
import { send, type Action, type World } from './world'

export const FINGER = 1
const OTHER_FINGER = 2
const DRAG_PX = 50
const MOVE_MS = 10

function person(label: string, event: (world: World) => MotionEvent): Action {
  return {
    by: 'person',
    label,
    run: (world, sent) => send(world, event(world), sent),
  }
}

const KEYS: ReadonlyArray<Action> = [
  person('the ring is pressed at 100°', () => ({
    hue: hueAt(100),
    type: 'aim',
  })),
  person('an arrow key goes down', () => ({ by: 5, type: 'nudge' })),
  person('the key comes up or focus leaves', () => ({ type: 'letGo' })),
  person('the mouse wheel turns a notch', () => ({ by: 5, type: 'scroll' })),
  person('+ is pressed', () => ({ by: 5, type: 'step' })),
  person('− is pressed', () => ({ by: -5, type: 'step' })),
  person('a square is picked', () => ({
    pick: { brightness: 75, saturation: 62 },
    type: 'choose',
  })),
  person('the pick is cleared', () => ({ pick: null, type: 'choose' })),
  person('an agent chooses a colour', () => ({
    hue: hueAt(40),
    pick: { brightness: 50, saturation: 88 },
    type: 'jump',
  })),
]

/** Wheel sends the dial's rotation, which points at the hue on show. */
type Finger = {
  readonly fromEdge: boolean
  readonly pointerId: number
  readonly x: number
}

function press(world: World, { fromEdge, pointerId, x }: Finger): MotionEvent {
  const turn = shownHue(world.motion, world.url.hue)

  return { fromEdge, pointerId, radius: 520, time: 0, turn, type: 'press', x }
}

function fingerSteps(world: World): ReadonlyArray<Action> {
  if (!world.fingers.includes(FINGER)) {
    return [
      person('a finger lands on the wheel', w =>
        press(w, { fromEdge: false, pointerId: FINGER, x: 200 }),
      ),
      person('a finger lands at the screen edge', w =>
        press(w, { fromEdge: true, pointerId: FINGER, x: 200 }),
      ),
    ]
  }

  const released = (reduced: boolean): MotionEvent => ({
    pointerId: FINGER,
    reduced,
    tapAngle: 20,
    time: world.gestureMs + 1,
    type: 'release',
    x: world.fingerX,
  })

  return [
    person('the finger slides left', w => ({
      pointerId: FINGER,
      time: w.gestureMs + MOVE_MS,
      type: 'move',
      x: w.fingerX - DRAG_PX,
    })),
    person('the finger lifts', () => released(false)),
    person('the finger lifts, with reduced motion on', () => released(true)),
    person('the browser cancels the finger', () => ({
      pointerId: FINGER,
      type: 'cancel',
    })),
  ]
}

function otherFingerSteps(world: World): ReadonlyArray<Action> {
  return world.fingers.includes(OTHER_FINGER)
    ? [
        person('a second finger slides', () => ({
          pointerId: OTHER_FINGER,
          time: MOVE_MS,
          type: 'move',
          x: 400,
        })),
      ]
    : [
        person('a second finger lands', w =>
          press(w, { fromEdge: false, pointerId: OTHER_FINGER, x: 20 }),
        ),
      ]
}

const frame: Action = {
  by: 'page',
  label: 'a coasting frame passes',
  run: (world, sent) => send(world, { elapsed: 40, type: 'frame' }, sent),
}

const MAX_FRAMES = 10_000

export const coastOut: Action = {
  by: 'page',
  label: 'the coast runs until it stops',
  run: (world, sent) => {
    let next = world

    for (let frames = 0; next.motion.kind === 'coasting'; frames++) {
      if (frames > MAX_FRAMES) {
        throw new Error('The coast never stopped.')
      }

      next = frame.run(next, sent)
    }

    return next
  },
}

export const pause: Action = {
  by: 'page',
  label: 'the mouse wheel pauses',
  run: (world, sent) => send(world, { type: 'pause' }, sent),
}

export const load: Action = {
  by: 'page',
  label: 'the router finishes loading',
  run: (world, sent) => {
    const moved: World = {
      ...world,
      loading: false,
      pending: [],
      url: world.entries.at(-1) ?? world.url,
    }

    return world.pending
      .toReversed()
      .reduce((next, hue) => send(next, { hue, type: 'landed' }, sent), moved)
  },
}

export const back: Action = {
  by: 'page',
  label: 'the viewer goes Back',
  run: (world, sent) =>
    send(
      { ...world, entries: world.entries.slice(0, -1), loading: true },
      { type: 'traverse' },
      sent,
    ),
}

/** Every step the person or the page can take from `world`. */
export function actions(world: World): ReadonlyArray<Action> {
  const coasting = world.motion.kind === 'coasting'

  return [
    ...KEYS,
    ...fingerSteps(world),
    ...otherFingerSteps(world),
    ...(coasting ? [frame, coastOut] : []),
    ...(world.motion.kind === 'scrolling' ? [pause] : []),
    ...(world.loading ? [load] : []),
    ...(world.entries.length > 1 ? [back] : []),
  ]
}
