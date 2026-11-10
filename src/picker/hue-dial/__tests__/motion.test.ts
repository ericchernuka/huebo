import { describe, expect, test } from 'vitest'
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

const AT_200 = hueAt(200)

type Run = { readonly commits: ReadonlyArray<Commit>; readonly motion: Motion }

function run(start: Motion, events: ReadonlyArray<MotionEvent>) {
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

const press = (x: number, pointerId = 1, fromEdge = false): MotionEvent => ({
  fromEdge,
  pointerId,
  radius: 520,
  time: 0,
  turn: 200,
  type: 'press',
  x,
})

const move = (x: number, time: number, pointerId = 1): MotionEvent => ({
  pointerId,
  time,
  type: 'move',
  x,
})

const release = (
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

const coasting: Motion = { at: 230, kind: 'coasting', velocity: 0.5 }

describe('keys and the ring', () => {
  test('given nothing moving, when a key is held, then the hue previews and commits once on let go', () => {
    const { commits, motion } = run(IDLE, [
      { by: 5, type: 'nudge' },
      { by: 5, type: 'nudge' },
      { type: 'letGo' },
    ])

    expect(commits).toEqual([{ announce: false, hue: 210 }])
    expect(motion).toEqual({ hue: 210, kind: 'landing' })
  })

  test('given nothing held, when focus leaves, then nothing commits', () => {
    expect(run(IDLE, [{ type: 'letGo' }]).commits).toEqual([])
  })
})

describe('the mouse wheel', () => {
  test('given notches, when they pause, then the scroll commits once', () => {
    const { commits } = run(IDLE, [
      { by: 5, type: 'scroll' },
      { by: 5, type: 'scroll' },
      { type: 'pause' },
    ])

    expect(commits).toEqual([{ announce: false, hue: 210 }])
  })

  test('given a scroll waiting for its pause, when a key steps, then the key wins and the pause commits nothing', () => {
    const { commits, motion } = run(IDLE, [
      { by: 5, type: 'scroll' },
      { by: 5, type: 'nudge' },
      { type: 'pause' },
    ])

    expect(commits).toEqual([])
    expect(motion).toEqual({ hue: 210, kind: 'held' })
  })
})

describe('choices made while the wheel coasts', () => {
  test.each<[string, MotionEvent, unknown]>([
    ['− or +', { by: 5, type: 'step' }, { announce: true, hue: 235 }],
    [
      'a pick',
      { pick: { brightness: 75, saturation: 62 }, type: 'choose' },
      { announce: false, hue: 230, pick: { brightness: 75, saturation: 62 } },
    ],
    [
      "an agent's colour",
      { hue: hueAt(40), pick: null, type: 'jump' },
      { announce: false, hue: 40, pick: null },
    ],
  ])(
    'given a coast, when %s lands, then it commits from where the coast was and the coast is over',
    (_, event, commit) => {
      const { commits, motion } = run(coasting, [
        event,
        { elapsed: 16, type: 'frame' },
      ])

      expect(commits).toEqual([commit])
      expect(motion.kind).toBe('landing')
    },
  )

  test('given a coast, when an arrow key goes down, then the wheel stops and steps from where it was', () => {
    expect(run(coasting, [{ by: 5, type: 'nudge' }]).motion).toEqual({
      hue: 235,
      kind: 'held',
    })
  })
})

describe('history', () => {
  test.each<Motion>([
    coasting,
    { hue: hueAt(215), kind: 'scrolling' },
    { hue: hueAt(215), kind: 'landing' },
  ])('given $kind, when the viewer goes Back, then it stops', start => {
    expect(run(start, [{ type: 'traverse' }]).motion).toBe(IDLE)
  })

  test('given a key held, when the viewer goes Back, then the hold carries on', () => {
    const held: Motion = { hue: hueAt(215), kind: 'held' }

    expect(run(held, [{ type: 'traverse' }]).motion).toBe(held)
  })

  test('given a landing, when a different hue lands, then it keeps waiting for its own', () => {
    const landing: Motion = { hue: hueAt(215), kind: 'landing' }

    expect(run(landing, [{ hue: hueAt(210), type: 'landed' }]).motion).toBe(
      landing,
    )
    expect(run(landing, [{ hue: hueAt(215), type: 'landed' }]).motion).toBe(
      IDLE,
    )
  })
})

describe('the phone wheel', () => {
  test('given a finger down, when it lifts without moving, then the tapped segment commits and is announced', () => {
    const { commits } = run(IDLE, [
      press(200),
      release(200, 50, { tapAngle: 22 }),
    ])

    expect(commits).toEqual([{ announce: true, hue: 220 }])
  })

  test('given a drag, then the wheel turns freely and the hue on show follows it', () => {
    const { motion } = run(IDLE, [press(200), move(110, 20)])

    expect(freeTurn(motion)).toBeCloseTo(209.9, 1)
    expect(shownHue(motion, AT_200)).toBe(210)
  })

  test('given a flick, when it lets go, then the wheel coasts and later lands once, announced', () => {
    const flicked = run(IDLE, [
      press(300),
      move(250, 10),
      move(200, 20),
      release(200, 21),
    ])

    expect(flicked.motion.kind).toBe('coasting')

    const frames = Array.from({ length: 200 }, (): MotionEvent => ({
      elapsed: 40,
      type: 'frame',
    }))

    const rest = run(flicked.motion, frames)

    expect(rest.commits).toHaveLength(1)
    expect(rest.commits[0]).toMatchObject({ announce: true })
    expect(rest.motion.kind).toBe('landing')
  })

  test('given reduced motion, when a flick lets go, then the wheel lands where it was let go', () => {
    const { motion } = run(IDLE, [
      press(300),
      move(250, 10),
      move(200, 20),
      release(200, 21, { reduced: true }),
    ])

    expect(motion.kind).toBe('landing')
  })

  test('given a finger on the wheel, when a second finger lands and moves, then the wheel ignores it', () => {
    const one = run(IDLE, [press(200), move(150, 10)])
    const two = run(one.motion, [press(20, 2), move(400, 20, 2)])

    expect(two.motion).toBe(one.motion)
  })

  test('given a drag from the screen edge, then it never turns the wheel', () => {
    const { motion } = run(IDLE, [press(10, 1, true), move(200, 20)])

    expect(freeTurn(motion)).toBeNull()
    expect(shownHue(motion, AT_200)).toBe(200)
  })

  test('given a coast, when a finger lands, then it catches the wheel where it was', () => {
    const { motion } = run(coasting, [press(200)])

    expect(motion.kind).toBe('turning')
    expect(freeTurn(motion)).toBe(230)
  })
})
