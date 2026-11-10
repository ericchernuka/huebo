import { afterEach, describe, expect, test } from 'vitest'
import { toJsonSchema } from '@valibot/to-json-schema'
import * as v from 'valibot'
import { page } from 'vitest/browser'
import { installAgent } from '../../../__tests__/agent'
import { expectPath, openAt, picked } from '../../../__tests__/app'
import { ChoiceInput, FormatInput, SquaresInput } from '../requests'

let agent = installAgent()

afterEach(() => {
  agent.uninstall()
  agent = installAgent()
})

async function openForAgent(path: string) {
  const opened = await openAt(path)

  await expect.poll(() => agent.names()).toHaveLength(4)

  return opened
}

const SquaresReply = v.object({
  hue: v.number(),
  squares: v.array(
    v.object({
      bestText: v.object({ name: v.string() }),
      brightness: v.number(),
      saturation: v.number(),
    }),
  ),
})

/** Calls a tool that should succeed, and reads its reply. */
async function ask(name: string, input: Parameters<typeof agent.call>[1]) {
  const reply = await agent.call(name, input)

  if (reply.error) {
    throw new Error(`${name} refused: ${reply.text}`)
  }

  const parsed: unknown = JSON.parse(reply.text)

  return parsed
}

describe('an agent on the page', () => {
  test('given the page, when an agent looks, then it finds the colour tools', async () => {
    await openForAgent('/200')

    expect(agent.names()).toEqual([
      'choose_colour',
      'choose_format',
      'list_squares',
      'read_colour',
    ])
  })
})

/**
 * The rules in a tool's input schema. `v.object` drops the keys it doesn't
 * name, so prose and the converter's `$schema` fall away on both sides.
 */
const Rules = v.object({
  additionalProperties: v.boolean(),
  properties: v.record(
    v.string(),
    v.object({
      enum: v.optional(v.array(v.string())),
      maximum: v.optional(v.number()),
      minimum: v.optional(v.number()),
      pattern: v.optional(v.string()),
      type: v.string(),
    }),
  ),
  required: v.optional(v.array(v.string()), []),
  type: v.literal('object'),
})

describe('what an agent is told about inputs', () => {
  test.each([
    ['choose_colour', ChoiceInput],
    ['choose_format', FormatInput],
    ['list_squares', SquaresInput],
  ])(
    'given the page, when an agent reads %s, then its inputs match what the tool checks',
    async (name, schema) => {
      await openForAgent('/200')

      expect(v.parse(Rules, agent.inputs(name))).toEqual(
        v.parse(Rules, toJsonSchema(schema, { errorMode: 'ignore' })),
      )
    },
  )
})

describe('reading the colour', () => {
  test('given a link to a colour, when an agent reads it, then it gets every format, the text contrast and the link', async () => {
    await openForAgent('/200/62/75')

    expect(await ask('read_colour', {})).toEqual({
      hue: 200,
      hueName: '200 degrees, azure',
      link: `${location.origin}/200/62/75`,
      pick: { brightness: 75, saturation: 62 },
      textContrast: [
        { grade: 'AA large', name: 'White', ratio: 3.2 },
        { grade: 'AA', name: 'Black', ratio: 6.5 },
      ],
      values: { HSB: '200,62,75', Hex: '#4998BF', RGB: '73,152,191' },
    })
  })

  test('given a hue, when an agent lists the squares, then they run brightest row first, least saturated first, each with the text that reads best', async () => {
    await openForAgent('/200')

    const { hue, squares } = v.parse(
      SquaresReply,
      await ask('list_squares', {}),
    )

    expect(hue).toBe(200)
    expect(squares).toHaveLength(64)
    expect(squares).toMatchObject({
      0: { bestText: { name: 'Black' }, brightness: 100, saturation: 12 },
      63: { bestText: { name: 'White' }, brightness: 12, saturation: 100 },
    })
  })

  test('given white and black round to the same tenth, when an agent lists the squares, then the square names the one with more contrast', async () => {
    await openForAgent('/200')

    const { hue, squares } = v.parse(
      SquaresReply,
      await ask('list_squares', { hue: 21 }),
    )

    expect(hue).toBe(20)

    const square = squares.find(
      ({ brightness, saturation }) => brightness === 62 && saturation === 50,
    )

    expect(square?.bestText.name).toBe('Black')
  })
})

describe('choosing a colour', () => {
  test('given a hue, when an agent chooses a hex on the grid, then that colour is picked as one history entry, with no notes', async () => {
    const { history } = await openForAgent('/200')
    const entries = history.length

    const reply = await ask('choose_colour', { hex: '#4998bf' })

    expect(reply).toMatchObject({ notes: [], values: { Hex: '#4998BF' } })
    await expectPath(history, '/200/62/75')
    expect(history.length).toBe(entries + 1)
    await expect
      .element(picked())
      .toHaveAccessibleName(/Saturation 62, brightness 75, #4998BF/)
  })

  test('given a hex off the grid, when an agent chooses it, then the nearest colour is picked and the notes name it', async () => {
    await openForAgent('/200')

    const reply = await ask('choose_colour', { hex: 'f80' })

    expect(reply).toMatchObject({
      notes: ["#FF8800 isn't on Huebo's grid; the nearest is #FF8000."],
      values: { Hex: '#FF8000' },
    })
  })

  test('given a pick, when an agent chooses only a hue between stops, then it snaps, says so, the pick stays and Back undoes it', async () => {
    const { history } = await openForAgent('/200/62/75')

    const reply = await ask('choose_colour', { hue: 41 })

    expect(reply).toMatchObject({
      notes: ["Hue 41 isn't one of the 72 stops, so it's 40."],
    })
    await expectPath(history, '/40/62/75')

    history.back()
    await expectPath(history, '/200/62/75')
  })

  test('given a hue past 355, when an agent chooses it, then it wraps to the nearest stop', async () => {
    const { history } = await openForAgent('/200/62/75')

    await ask('choose_colour', { hue: 358 })

    await expectPath(history, '/0/62/75')
  })

  test('given a pick, when an agent gives only a saturation, then the brightness stays and the saturation snaps to a step', async () => {
    const { history } = await openForAgent('/200/62/75')

    const reply = await ask('choose_colour', { saturation: 90 })

    expect(reply).toMatchObject({
      notes: ["saturation 90 isn't a step, so it's 88."],
    })
    await expectPath(history, '/200/88/75')
  })

  test('given a pick, when an agent clears it, then only the hue is left', async () => {
    const { history } = await openForAgent('/200/62/75')

    await ask('choose_colour', { clearPick: true })

    await expectPath(history, '/200')
    await expect.element(picked()).not.toBeInTheDocument()
  })

  test('given no pick, when an agent gives only a saturation, then it is told to give both and nothing changes', async () => {
    const { history } = await openForAgent('/200')
    const entries = history.length

    const reply = await agent.call('choose_colour', { saturation: 50 })

    expect(reply).toEqual({
      error: true,
      text: 'Nothing is picked yet, so give both saturation and brightness.',
    })
    expect(history.location.pathname).toBe('/200')
    expect(history.length).toBe(entries)
  })

  test.each([
    ['nothing to change', {}, 'Nothing to choose'],
    [
      'clearPick with a saturation',
      { clearPick: true, saturation: 50 },
      "clearPick can't be combined",
    ],
    ['a hex with a hue', { hex: '#fff', hue: 20 }, "hex can't be combined"],
    ['a saturation over 100', { saturation: 120 }, 'saturation'],
    ['a malformed hex', { hex: 'red' }, 'hex must look like #3366CC'],
    ['a field it has no name for', { colour: 'red' }, 'colour'],
  ])(
    'given a pick, when an agent asks for %s, then it is told why and nothing changes',
    async (_, input, reason) => {
      const { history } = await openForAgent('/200/62/75')
      const entries = history.length

      const reply = await agent.call('choose_colour', input)

      expect(reply.error).toBe(true)
      expect(reply.text).toContain(reason)
      expect(history.location.pathname).toBe('/200/62/75')
      expect(history.length).toBe(entries)
    },
  )
})

describe('choosing a format', () => {
  test('given a pick, when an agent chooses a format, then the card shows it and Copy writes it', async () => {
    await openForAgent('/200/62/75')

    expect(await ask('choose_format', { format: 'RGB' })).toEqual({
      format: 'RGB',
      value: '73,152,191',
    })
    await expect.element(page.getByRole('radio', { name: 'RGB' })).toBeChecked()
    await expect
      .element(page.getByRole('button', { name: 'Copy RGB' }))
      .toBeVisible()
  })

  test('given a format the card has no name for, when an agent chooses it, then it is refused and the card keeps its format', async () => {
    await openForAgent('/200/62/75')

    expect((await agent.call('choose_format', { format: 'CMYK' })).error).toBe(
      true,
    )
    await expect.element(page.getByRole('radio', { name: 'Hex' })).toBeChecked()
  })
})
