import { describe, expect, test } from 'vitest'
import { hueAt, type Color } from '../color'
import {
  ChoiceInput,
  parseInput,
  report,
  resolveChoice,
  squaresOf,
} from './requests'

const PICKED: Color = {
  hue: hueAt(200),
  pick: { brightness: 75, saturation: 62 },
}

const HUE_ONLY: Color = { hue: hueAt(200), pick: null }

describe('choosing a colour', () => {
  test('given a pick, when an agent gives only a hue, then the pick stays', () => {
    expect(resolveChoice({ hue: 40 }, PICKED)).toEqual({
      color: { hue: 40, pick: PICKED.pick },
      notes: [],
    })
  })

  test('given a hue between stops or past 355, when chosen, then it snaps to the nearest stop and says so', () => {
    expect(resolveChoice({ hue: 358 }, PICKED)).toEqual({
      color: { hue: 0, pick: PICKED.pick },
      notes: ["Hue 358 isn't one of the 72 stops, so it's 0."],
    })
  })

  test('given a pick, when an agent gives only a saturation, then the brightness stays and the saturation snaps to a step', () => {
    expect(resolveChoice({ saturation: 90 }, PICKED)).toEqual({
      color: { hue: 200, pick: { brightness: 75, saturation: 88 } },
      notes: ["saturation 90 isn't a step, so it's 88."],
    })
  })

  test('given no pick, when an agent gives only a saturation, then it is told to give both', () => {
    expect(() => resolveChoice({ saturation: 50 }, HUE_ONLY)).toThrow(
      'give both saturation and brightness',
    )
  })

  test('given a pick, when an agent clears it, then only the hue is left', () => {
    expect(resolveChoice({ clearPick: true }, PICKED).color).toEqual(HUE_ONLY)
  })

  test('given clearPick with a saturation, then it is refused', () => {
    expect(() =>
      resolveChoice({ clearPick: true, saturation: 50 }, PICKED),
    ).toThrow("clearPick can't be combined")
  })

  test('given nothing to change, then it is refused', () => {
    expect(() => resolveChoice({}, PICKED)).toThrow('Nothing to choose')
  })
})

describe('choosing by hex', () => {
  test("given a hex on Huebo's grid, then it is that colour, with no notes", () => {
    expect(resolveChoice({ hex: '#4998bf' }, HUE_ONLY)).toEqual({
      color: PICKED,
      notes: [],
    })
  })

  test('given a hex off the grid, then it is the nearest colour, and the notes name it', () => {
    const { color, notes } = resolveChoice({ hex: 'f80' }, HUE_ONLY)

    expect(report(color, '').values?.Hex).toBe('#FF8000')
    expect(notes).toEqual([
      "#FF8800 isn't on Huebo's grid; the nearest is #FF8000.",
    ])
  })

  test('given a hex with a hue, then it is refused', () => {
    expect(() => resolveChoice({ hex: '#fff', hue: 20 }, PICKED)).toThrow(
      "hex can't be combined",
    )
  })
})

describe('parsing what an agent sends', () => {
  test.each<[string, ChoiceInput]>([
    ['a saturation over 100', { saturation: 120 }],
    ['a malformed hex', { hex: 'red' }],
  ])('given %s, then it is refused with a reason', (_, input) => {
    expect(() => parseInput(ChoiceInput, input)).toThrow(/\S/)
  })
})

describe('reading', () => {
  test('given a pick, then the report has every format, the text contrast and the link', () => {
    expect(report(PICKED, 'https://huebo.test/200/62/75')).toEqual({
      hue: 200,
      hueName: '200 degrees, azure',
      link: 'https://huebo.test/200/62/75',
      pick: PICKED.pick,
      textContrast: [
        { grade: 'AA large', name: 'White', ratio: 3.2 },
        { grade: 'AA', name: 'Black', ratio: 6.5 },
      ],
      values: { HSB: '200,62,75', Hex: '#4998BF', RGB: '73,152,191' },
    })
  })

  test('given a hue, then its squares run brightest row first, least saturated first, each with the text that reads best', () => {
    const squares = squaresOf(hueAt(200))

    expect(squares).toHaveLength(64)
    expect(squares[0]).toMatchObject({ brightness: 100, saturation: 12 })
    expect(squares[0]?.bestText.name).toBe('Black')
    expect(squares.at(-1)).toMatchObject({ brightness: 12, saturation: 100 })
    expect(squares.at(-1)?.bestText.name).toBe('White')
  })

  test('given white and black round to the same tenth, then the square names the one with more contrast', () => {
    const square = squaresOf(hueAt(20)).find(
      ({ brightness, saturation }) => brightness === 62 && saturation === 50,
    )

    expect(square?.bestText.name).toBe('Black')
  })
})
