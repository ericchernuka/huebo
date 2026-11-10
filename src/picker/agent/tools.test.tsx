import { afterEach, describe, expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { installAgent } from '../../test/agent'
import { expectPath, openAt, picked } from '../../test/app'

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

  test('given a link to a colour, when an agent reads it, then it gets every format, the contrast and the link', async () => {
    await openForAgent('/200/62/75')

    const reply = await agent.call('read_colour', {})

    expect(JSON.parse(reply.text)).toMatchObject({
      hue: 200,
      link: `${location.origin}/200/62/75`,
      pick: { brightness: 75, saturation: 62 },
      values: { HSB: '200,62,75', Hex: '#4998BF', RGB: '73,152,191' },
    })
  })

  test('given a hue, when an agent chooses a hex, then the nearest colour is picked as one history entry', async () => {
    const { history } = await openForAgent('/200')
    const entries = history.length

    const reply = await agent.call('choose_colour', { hex: '#4998BF' })

    expect(reply.error).toBe(false)
    await expectPath(history, '/200/62/75')
    expect(history.length).toBe(entries + 1)
    await expect
      .element(picked())
      .toHaveAccessibleName(/Saturation 62, brightness 75, #4998BF/)
  })

  test('given a pick, when an agent chooses only a hue, then the pick stays and Back undoes it', async () => {
    const { history } = await openForAgent('/200/62/75')

    await agent.call('choose_colour', { hue: 41 })
    await expectPath(history, '/40/62/75')

    history.back()
    await expectPath(history, '/200/62/75')
  })

  test('given a pick, when an agent asks for something Huebo cannot do, then it is told why and nothing changes', async () => {
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
    ['choose_colour', { colour: 'red' }],
    ['choose_format', { format: 'CMYK' }],
  ])(
    'given %s with %o, which the tool has no name for, then it is refused',
    async (name, input) => {
      await openForAgent('/200/62/75')

      expect((await agent.call(name, input)).error).toBe(true)
    },
  )

  test('given a pick, when an agent chooses a format, then the card shows it and Copy writes it', async () => {
    await openForAgent('/200/62/75')

    const reply = await agent.call('choose_format', { format: 'RGB' })

    expect(JSON.parse(reply.text)).toEqual({
      format: 'RGB',
      value: '73,152,191',
    })
    await expect.element(page.getByRole('radio', { name: 'RGB' })).toBeChecked()
    await expect
      .element(page.getByRole('button', { name: 'Copy RGB' }))
      .toBeVisible()
  })
})
