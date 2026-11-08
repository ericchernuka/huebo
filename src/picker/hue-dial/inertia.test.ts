import { describe, expect, test } from 'vitest'
import {
  coast,
  flickVelocity,
  recordSample,
  type Coast,
  type Sample,
} from './inertia'

const RADIUS = 520

/** A drag that moves `pxPerMs` for 100ms in 16ms steps and lifts straight away. */
function drag(pxPerMs: number) {
  let samples: Array<Sample> = []

  for (let time = 0; time <= 96; time += 16) {
    samples = recordSample(samples, { time, x: 300 - pxPerMs * time })
  }

  return { release: 100, samples }
}

function travel(velocity: number): number {
  let state: Coast | null = { turn: 0, velocity }
  let turn = 0

  while (state) {
    turn = state.turn
    state = coast(state, 16)
  }

  return turn
}

describe('given a finger on the phone wheel', () => {
  test('when it flicks left at about 3,000 px/s, then the wheel coasts forward about 200°', () => {
    const { release, samples } = drag(3)
    const velocity = flickVelocity(samples, release, RADIUS)

    expect(velocity).not.toBeNull()
    expect(travel(velocity ?? 0)).toBeGreaterThan(180)
    expect(travel(velocity ?? 0)).toBeLessThan(220)
  })

  test('when it flicks right, then the wheel coasts backwards', () => {
    const { release, samples } = drag(-3)

    expect(flickVelocity(samples, release, RADIUS)).toBeLessThan(0)
  })

  test('when it drags slowly and lets go, then the wheel stays put', () => {
    const { release, samples } = drag(0.1)

    expect(flickVelocity(samples, release, RADIUS)).toBeNull()
  })

  test('when it pauses before lifting, then the earlier speed is forgotten', () => {
    const { samples } = drag(3)

    expect(flickVelocity(samples, 200, RADIUS)).toBeNull()
  })

  test('when it drags for a long time, then only the last 80ms count', () => {
    let samples: Array<Sample> = []

    for (let time = 0; time <= 1600; time += 16) {
      samples = recordSample(samples, { time, x: time })
    }

    expect(samples.map(sample => sample.time)).toEqual([
      1520, 1536, 1552, 1568, 1584, 1600,
    ])
  })
})
