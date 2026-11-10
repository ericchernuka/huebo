import { describe, expect, test } from 'vitest'
import {
  STEPS,
  colorPath,
  hueAt,
  linkPath,
  parseColorPath,
  stepAt,
} from '../color'

const hues = Array.from({ length: 72 }, (_, index) => String(index * 5))

describe('given a shared link', () => {
  test('when it is /{hue} for each of the 72 hues, then it opens that hue with nothing picked', () => {
    for (const hue of hues) {
      expect(parseColorPath({ hue })).toEqual({ hue: Number(hue), pick: null })
    }
  })

  test('when it is /{hue}/{saturation}/{brightness} for all 4,608 colours, then it opens that colour picked', () => {
    for (const hue of hues) {
      for (const saturation of STEPS) {
        for (const brightness of STEPS) {
          const raw = {
            brightness: String(brightness),
            hue,
            saturation: String(saturation),
          }

          expect(parseColorPath(raw)).toEqual({
            hue: Number(hue),
            pick: { brightness, saturation },
          })
        }
      }
    }
  })

  test('when the hue has leading zeros, as the old router allowed, then it still opens', () => {
    expect(parseColorPath({ hue: '060' })).toEqual({ hue: 60, pick: null })
  })

  test.each([
    ['a hue off the 5° grid', { hue: '61' }],
    ['a hue past 355', { hue: '360' }],
    ['a negative hue', { hue: '-5' }],
    ['a non-numeric hue', { hue: 'red' }],
    ['a decimal hue', { hue: '60.0' }],
    [
      'a saturation that is not a step',
      { brightness: '75', hue: '200', saturation: '60' },
    ],
    ['a padded step', { brightness: '075', hue: '200', saturation: '62' }],
    ['a saturation without a brightness', { hue: '200', saturation: '62' }],
  ])('when it has %s, then it is rejected', (_, raw) => {
    expect(parseColorPath(raw)).toBeNull()
  })
})

test('given any colour, when it is written to a path and read back, then it is unchanged', () => {
  const picked = {
    hue: hueAt(200),
    pick: { brightness: 75, saturation: 62 },
  } as const

  const unpicked = { hue: hueAt(0), pick: null }

  expect(colorPath(picked)).toEqual({
    brightness: '75',
    hue: '200',
    saturation: '62',
  })
  expect(parseColorPath(colorPath(picked))).toEqual(picked)
  expect(parseColorPath(colorPath(unpicked))).toEqual(unpicked)
})

test('given a colour, when its link is written, then the path has the hue and any pick', () => {
  expect(linkPath({ hue: hueAt(0), pick: null })).toBe('/0')
  expect(
    linkPath({ hue: hueAt(200), pick: { brightness: 75, saturation: 62 } }),
  ).toBe('/200/62/75')
})

test('given an angle from a drag, when it becomes a hue, then it snaps to the nearest stop and wraps', () => {
  expect([
    hueAt(-5),
    hueAt(357.4),
    hueAt(362.6),
    hueAt(-722),
    hueAt(7.4),
  ]).toEqual([355, 355, 5, 0, 5])
})

test('given any saturation or brightness, when it becomes a step, then it is the nearest one', () => {
  expect([stepAt(0), stepAt(55), stepAt(57), stepAt(90), stepAt(100)]).toEqual([
    12, 50, 62, 88, 100,
  ])
})
