import { expect } from 'vitest'
import { hueAt } from '../../color'
import {
  freeTurn,
  IDLE,
  shownHue,
  transition,
  type Commit,
  type Motion,
  type MotionEvent,
} from '../motion'

// Inputs for motion.test.ts, sent through the real `transition`. Tests read only
// what the page reads back: the commits, the shown hue and the free turn.

export const AT_200 = hueAt(200)

const RADIUS_PX = 520

const FRAME_MS = 16

type Run = { readonly commits: ReadonlyArray<Commit>; readonly motion: Motion }

/** Sends `events` in order, with the link at hue 200. */
export function run(start: Motion, events: ReadonlyArray<MotionEvent>) {
  return events.reduce<Run>(
    (state, event) => {
      const next = transition(state.motion, event, AT_200)

      return {
        commits: next.commit ? [...state.commits, next.commit] : state.commits,
        motion: next.motion,
      }
    },
    { commits: [], motion: start },
  )
}

export const shown = (motion: Motion) => shownHue(motion, AT_200)

export const press = (
  x: number,
  pointerId = 1,
  fromEdge = false,
): MotionEvent => ({
  fromEdge,
  pointerId,
  radius: RADIUS_PX,
  time: 0,
  turn: 200,
  type: 'press',
  x,
})

export const move = (x: number, time: number, pointerId = 1): MotionEvent => ({
  pointerId,
  time,
  type: 'move',
  x,
})

export const release = (
  x: number,
  time: number,
  { reduced = false, tapAngle = 0 } = {},
): MotionEvent => ({
  pointerId: 1,
  reduced,
  tapAngle,
  time,
  type: 'release',
  x,
})

export const frames = (count: number): ReadonlyArray<MotionEvent> =>
  Array.from({ length: count }, () => ({ elapsed: FRAME_MS, type: 'frame' }))

/** Long enough for any coast to come to rest. */
export const UNTIL_REST = frames(1000)

export type Stretch = { readonly ms: number; readonly pxPerMs: number }

/**
 * A finger landing at x 300 and moving through each stretch in turn, a sample
 * every frame. Positive speeds move left, which turns the wheel forward.
 */
export function swipe(stretches: ReadonlyArray<Stretch>) {
  const events: Array<MotionEvent> = [press(300)]
  let time = 0
  let x = 300

  for (const { ms, pxPerMs } of stretches) {
    for (let elapsed = FRAME_MS; elapsed <= ms; elapsed += FRAME_MS) {
      time += FRAME_MS
      x -= pxPerMs * FRAME_MS
      events.push(move(x, time))
    }
  }

  return { events, time, x }
}

/** A swipe through `stretches`, lifted `liftMs` after the last sample. */
export function swipeAndLift(stretches: ReadonlyArray<Stretch>, liftMs = 4) {
  const { events, time, x } = swipe(stretches)

  return run(IDLE, [...events, release(x, time + liftMs)])
}

/** The phone wheel coasting forward, as a person leaves it after a flick. */
export function aCoast(): Motion {
  const { commits, motion } = swipeAndLift([{ ms: 96, pxPerMs: 3 }])

  expect(commits).toEqual([])
  expect(freeTurn(motion)).not.toBeNull()

  return motion
}

export const degreesBetween = (from: number, to: number) =>
  (((to - from) % 360) + 360) % 360
