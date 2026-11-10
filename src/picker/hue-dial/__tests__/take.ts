import type { Motion, MotionEvent } from '../motion'
import { back, FINGER } from './actions'
import { START, type Action, type Sent, type World } from './world'

const RUNS = new Set<Motion['kind']>(['coasting', 'scrolling'])

export type Taken = {
  readonly sent: ReadonlyArray<Sent>
  readonly world: World
}

/** Takes `step` from `world`, and keeps the ghost fields and the fingers in step. */
export function take(world: World, step: Action): Taken {
  const sent: Array<Sent> = []
  const after = step.run(world, sent)
  const first = sent[0]?.event

  return {
    sent,
    world: {
      ...after,
      ...fingersAfter(world, first),
      ...ghostsAfter(world, step, sent),
      keyDown: keyDownAfter(world, first),
      ownedRun: RUNS.has(after.motion.kind) && ownsRun(world, step, sent),
    },
  }
}

function ownsRun(world: World, step: Action, sent: ReadonlyArray<Sent>) {
  const type = sent[0]?.event.type

  if (type === 'release' || type === 'scroll') {
    return true
  }

  return world.ownedRun && step !== back && !sent.some(({ commit }) => commit)
}

function ghostsAfter(world: World, step: Action, sent: ReadonlyArray<Sent>) {
  const committed = sent.findLast(({ commit }) => commit)?.commit
  const interrupted = step.by === 'person' || step === back

  return { holding: committed?.hue ?? (interrupted ? null : world.holding) }
}

function keyDownAfter(world: World, event: MotionEvent | undefined) {
  switch (event?.type) {
    case 'aim':
    case 'nudge':
      return true
    case 'letGo':
      return false
    default:
      return world.keyDown
  }
}

type Fingers = Pick<World, 'fingerX' | 'fingers' | 'gestureMs'>

function fingersAfter(world: World, event: MotionEvent | undefined): Fingers {
  const { fingerX, fingers, gestureMs } = world

  switch (event?.type) {
    case 'press':
      return event.pointerId === FINGER
        ? { fingerX: event.x, fingers: [...fingers, FINGER], gestureMs: 0 }
        : { fingerX, fingers: [...fingers, event.pointerId], gestureMs }
    case 'move':
      return event.pointerId === FINGER
        ? { fingerX: event.x, fingers, gestureMs: event.time }
        : { fingerX, fingers, gestureMs }
    case 'release':
    case 'cancel':
      return {
        fingerX: START.fingerX,
        fingers: fingers.filter(id => id !== event.pointerId),
        gestureMs: 0,
      }
    default:
      return { fingerX, fingers, gestureMs }
  }
}
