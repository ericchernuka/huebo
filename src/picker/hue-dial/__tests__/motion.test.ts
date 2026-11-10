import { describe, expect, test } from 'vitest'
import { hueAt } from '../../color'
import {
  freeTurn,
  IDLE,
  nextLink,
  shownHue,
  type Commit,
  type Motion,
  type MotionEvent,
} from '../motion'
import {
  aCoast,
  AT_200,
  degreesBetween,
  frames,
  move,
  press,
  release,
  run,
  shown,
  swipe,
  swipeAndLift,
  UNTIL_REST,
  type Stretch,
} from './script'

describe('keys and the ring', () => {
  test('given nothing moving, when a key is held, then the hue previews and commits once on let go', () => {
    const held = run(IDLE, [
      { by: 5, type: 'nudge' },
      { by: 5, type: 'nudge' },
    ])

    expect(held.commits).toEqual([])
    expect(shown(held.motion)).toBe(210)

    const { commits, motion } = run(held.motion, [{ type: 'letGo' }])

    expect(commits).toEqual([{ announce: false, hue: 210 }])
    expect(shown(motion)).toBe(210)
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
    const paused = run(IDLE, [
      { by: 5, type: 'scroll' },
      { by: 5, type: 'nudge' },
      { type: 'pause' },
    ])

    expect(paused.commits).toEqual([])
    expect(shown(paused.motion)).toBe(210)
    expect(run(paused.motion, [{ type: 'letGo' }]).commits).toEqual([
      { announce: false, hue: 210 },
    ])
  })
})

describe('choices made while the wheel coasts', () => {
  const PICK = { brightness: 75, saturation: 62 } as const

  test.each<[string, MotionEvent, (from: number) => Commit]>([
    [
      '− or +',
      { by: 5, type: 'step' },
      from => ({ announce: true, hue: hueAt(from + 5) }),
    ],
    [
      'a pick',
      { pick: PICK, type: 'choose' },
      from => ({ announce: true, hue: hueAt(from), pick: PICK }),
    ],
    [
      "an agent's colour",
      { hue: hueAt(40), pick: null, type: 'jump' },
      () => ({ announce: true, hue: hueAt(40), pick: null }),
    ],
  ])(
    'given a coast, when %s lands, then it commits from where the coast was and the coast is over',
    (_, event, expected) => {
      const coast = aCoast()
      const commit = expected(shown(coast))

      const { commits, motion } = run(coast, [event, ...UNTIL_REST])

      expect(commits).toEqual([commit])
      expect(shown(motion)).toBe(commit.hue)
    },
  )

  test('given a coast, when an arrow key goes down, then the wheel stops and steps from where it was', () => {
    const coast = aCoast()
    const stepped = hueAt(shown(coast) + 5)

    const { commits, motion } = run(coast, [
      { by: 5, type: 'nudge' },
      ...frames(30),
    ])

    expect(commits).toEqual([])
    expect(shown(motion)).toBe(stepped)
  })
})

describe('history', () => {
  test.each<[string, () => Motion]>([
    ['a coast', aCoast],
    ['a scroll', () => run(IDLE, [{ by: 15, type: 'scroll' }]).motion],
    [
      'a landing',
      () => run(IDLE, [{ by: 15, type: 'nudge' }, { type: 'letGo' }]).motion,
    ],
  ])(
    'given %s, when the viewer goes Back, then it stops and the dial shows the link',
    (_, start) => {
      const { commits, motion } = run(start(), [
        { type: 'traverse' },
        { type: 'pause' },
        ...UNTIL_REST,
      ])

      expect(commits).toEqual([])
      expect(shown(motion)).toBe(200)
    },
  )

  test('given a key held, when the viewer goes Back, then the hold carries on', () => {
    const { commits, motion } = run(IDLE, [
      { by: 15, type: 'nudge' },
      { type: 'traverse' },
      { type: 'letGo' },
    ])

    expect(commits).toEqual([{ announce: false, hue: 215 }])
    expect(shown(motion)).toBe(215)
  })

  test('given a landing, when a different hue lands, then it keeps waiting for its own', () => {
    const landing = run(IDLE, [
      { by: 15, type: 'nudge' },
      { type: 'letGo' },
    ]).motion

    const other = run(landing, [{ hue: hueAt(210), type: 'landed' }]).motion
    const own = run(landing, [{ hue: hueAt(215), type: 'landed' }]).motion

    expect(shownHue(other, hueAt(210))).toBe(215)
    expect(shownHue(own, hueAt(220))).toBe(220)
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
    expect(shown(motion)).toBe(210)
  })

  test('given a flick left at about 3,000 px/s, when it lets go, then the wheel coasts forward about 200° and lands once, announced', () => {
    const coast = aCoast()
    const letGoAt = freeTurn(coast) ?? 0

    const { commits, motion } = run(coast, UNTIL_REST)

    expect(commits).toHaveLength(1)
    expect(commits[0]?.announce).toBe(true)
    expect(degreesBetween(letGoAt, commits[0]?.hue ?? 0)).toBeGreaterThan(180)
    expect(degreesBetween(letGoAt, commits[0]?.hue ?? 0)).toBeLessThan(220)
    expect(shown(motion)).toBe(commits[0]?.hue)
  })

  test('given a flick right, when it lets go, then the wheel coasts backwards', () => {
    const flicked = swipeAndLift([{ ms: 96, pxPerMs: -3 }])
    const letGoAt = freeTurn(flicked.motion) ?? 0

    expect(flicked.commits).toEqual([])
    expect(freeTurn(run(flicked.motion, frames(1)).motion)).toBeLessThan(
      letGoAt,
    )
  })

  test.each<[string, ReadonlyArray<Stretch>, number]>([
    ['it drags slowly and lets go', [{ ms: 96, pxPerMs: 0.1 }], 4],
    ['it pauses before lifting', [{ ms: 96, pxPerMs: 3 }], 104],
    [
      'it slows for the last stretch before lifting',
      [
        { ms: 96, pxPerMs: 3 },
        { ms: 320, pxPerMs: 0.1 },
      ],
      4,
    ],
  ])(
    'given a finger on the wheel, when %s, then the wheel lands where it was let go',
    (_, stretches, liftMs) => {
      const { commits, motion } = swipeAndLift(stretches, liftMs)

      expect(commits).toHaveLength(1)
      expect(commits[0]?.announce).toBe(true)
      expect(run(motion, UNTIL_REST).commits).toEqual([])
    },
  )

  test('given reduced motion, when a flick lets go, then the wheel lands where it was let go', () => {
    const { events, time, x } = swipe([{ ms: 96, pxPerMs: 3 }])

    const { commits } = run(IDLE, [
      ...events,
      release(x, time + 4, { reduced: true }),
    ])

    expect(commits).toHaveLength(1)
  })

  test('given a finger on the wheel, when a second finger lands and moves, then the wheel ignores it', () => {
    const one = run(IDLE, [press(200), move(150, 10)])
    const two = run(one.motion, [press(20, 2), move(400, 20, 2)])

    expect(freeTurn(two.motion)).toBe(freeTurn(one.motion))
    expect(shown(two.motion)).toBe(shown(one.motion))
  })

  test('given a drag from the screen edge, then it never turns the wheel', () => {
    const { motion } = run(IDLE, [press(10, 1, true), move(200, 20)])

    expect(freeTurn(motion)).toBeNull()
    expect(shown(motion)).toBe(200)
  })

  test('given a coast, when a finger lands, then it catches the wheel where it was', () => {
    const coast = aCoast()
    const caughtAt = freeTurn(coast)

    const { commits, motion } = run(coast, [press(200), ...frames(30)])

    expect(commits).toEqual([])
    expect(freeTurn(motion)).toBe(caughtAt)
  })
})

describe('where a choice takes the link', () => {
  const PICK = { brightness: 75, saturation: 62 } as const
  const link = { hue: AT_200, pick: PICK }

  test('given a hue-only choice of the hue in the link, then the link already holds it', () => {
    expect(nextLink({ announce: true, hue: AT_200 }, link)).toBeNull()
  })

  test('given a hue-only choice of a new hue, then the link keeps its pick', () => {
    expect(nextLink({ announce: true, hue: hueAt(210) }, link)).toEqual({
      hue: 210,
      pick: PICK,
    })
  })

  test('given a cleared pick, then the link drops its pick even at the same hue', () => {
    expect(nextLink({ announce: true, hue: AT_200, pick: null }, link)).toEqual(
      {
        hue: 200,
        pick: null,
      },
    )
  })
})
