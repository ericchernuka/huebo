import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-react'
import './global.css'
import { createAppRouter } from './router'
import type { PageView } from './shared/analytics'

/** Opens the app at `path` on a desktop-sized screen, recording page views. */
async function openAt(path: string) {
  const views: Array<PageView> = []
  const history = createMemoryHistory({ initialEntries: [path] })

  const router = createAppRouter(
    { trackPageView: view => views.push(view) },
    history,
  )

  await page.viewport(1280, 900)
  const screen = await render(<RouterProvider router={router} />)

  return { history, screen, views }
}

const square = (saturation: number, brightness: number) =>
  page.getByRole('button', {
    name: new RegExp(`^Saturation ${saturation}, brightness ${brightness},`),
  })

const picked = () => page.getByRole('gridcell', { selected: true })
const hueSlider = () => page.getByRole('slider', { name: 'Hue' })

async function expectPath(
  history: { location: { pathname: string } },
  path: string,
) {
  await expect.poll(() => history.location.pathname).toBe(path)
}

beforeEach(() => {
  localStorage.clear()
})

describe('shared links', () => {
  test('given a link to a colour, when it opens, then that colour is picked', async () => {
    await openAt('/200/62/75')

    await expect
      .element(page.getByText('#4998BF', { exact: true }))
      .toBeVisible()
    await expect
      .element(picked())
      .toHaveAccessibleName(/Saturation 62, brightness 75, #4998BF/)
    expect(document.title).toBe('HSB(200,62,75) | Huebo')
  })

  test('given a link to a hue, when it opens, then nothing is picked yet', async () => {
    await openAt('/200')

    await expect.element(page.getByText('Pick a colour')).toBeVisible()
    await expect.element(picked()).not.toBeInTheDocument()
    expect(document.title).toBe('Hue: 200 | Huebo')
  })

  test.each([
    '/',
    '/61',
    '/360',
    '/red',
    '/200/60/75',
    '/200/62',
    '/200/62/75/1',
  ])(
    'given the invalid path %s, when it opens, then it lands on hue 60',
    async path => {
      const { history } = await openAt(path)

      await expectPath(history, '/60')
      await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '60')
    },
  )

  test('given a hue with leading zeros, as the old router allowed, when the link opens, then the colour shows', async () => {
    await openAt('/060/12/100')

    await expect
      .element(picked())
      .toHaveAccessibleName(/Saturation 12, brightness 100,/)
  })
})

describe('picking', () => {
  test('given a hue, when a square is clicked, then it is picked and the URL holds it', async () => {
    const { history } = await openAt('/200')

    await square(62, 75).click()

    await expectPath(history, '/200/62/75')
    await expect
      .element(page.getByText('#4998BF', { exact: true }))
      .toBeVisible()
    await expect.element(page.getByText('Picked #4998BF')).toBeInTheDocument()
  })

  test('given a picked square, when it is clicked again, then the pick clears', async () => {
    const { history } = await openAt('/200/62/75')

    await square(62, 75).click()

    await expectPath(history, '/200')
    await expect.element(page.getByText('Pick a colour')).toBeVisible()
  })

  test('given two picks, when going back, then the first pick returns', async () => {
    const { history } = await openAt('/200')

    await square(62, 75).click()
    await expectPath(history, '/200/62/75')
    await square(100, 100).click()
    await expectPath(history, '/200/100/100')
    history.back()

    await expect
      .element(picked())
      .toHaveAccessibleName(/Saturation 62, brightness 75,/)
  })
})

describe('turning the hue', () => {
  test('given hue 355, when the hue goes up, then it wraps to 0 and keeps the pick', async () => {
    const { history } = await openAt('/355/62/75')

    await page
      .getByRole('button', { name: 'Increase hue by 5 degrees' })
      .click()

    await expectPath(history, '/0/62/75')
  })

  test('given hue 0, when the hue goes down, then it wraps to 355', async () => {
    const { history } = await openAt('/0')

    await page
      .getByRole('button', { name: 'Decrease hue by 5 degrees' })
      .click()

    await expectPath(history, '/355')
  })

  test.each([
    ['{ArrowRight}', '/205'],
    ['{ArrowLeft}', '/195'],
    ['{ArrowUp}', '/205'],
    ['{Shift>}{ArrowRight}{/Shift}', '/245'],
    ['{Shift>}{ArrowLeft}{/Shift}', '/155'],
    ['{PageUp}', '/245'],
    ['{PageDown}', '/155'],
    ['{Home}', '/0'],
    ['{End}', '/355'],
  ])(
    'given the dial has focus at 200, when %s is pressed, then the hue is %s',
    async (key, path) => {
      const { history } = await openAt('/200')

      hueSlider().element().focus()
      await userEvent.keyboard(key)

      await expectPath(history, path)
    },
  )

  test('given the dial has focus, when an arrow key is held down, then the hue turns live and history gets one entry', async () => {
    const { history, views } = await openAt('/200')

    hueSlider().element().focus()
    await userEvent.keyboard('{ArrowRight>6}')

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '230')
    expect(history.location.pathname).toBe('/200')

    await userEvent.keyboard('{/ArrowRight}')

    await expectPath(history, '/230')
    expect(views).toHaveLength(2)
    history.back()
    await expectPath(history, '/200')
  })

  test('given the dial has focus at 0, when Home is pressed, then no history entry is added', async () => {
    const { history, views } = await openAt('/0')

    hueSlider().element().focus()
    await userEvent.keyboard('{Home}')

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '0')
    expect(views).toHaveLength(1)
    expect(history.length).toBe(1)
  })

  test('given a turn, then the dial describes the hue', async () => {
    await openAt('/200')

    await expect
      .element(hueSlider())
      .toHaveAttribute('aria-valuetext', '200 degrees, azure')
  })
})

describe('the grid by keyboard', () => {
  test('given a picked square has focus, when arrows move and Enter is pressed, then the new square is picked', async () => {
    const { history } = await openAt('/200/62/75')

    square(62, 75).element().focus()
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}')

    await expectPath(history, '/200/75/62')
    await expect.element(square(75, 62)).toHaveFocus()
  })

  test('given a pick, when Escape is pressed in the grid, then the pick clears', async () => {
    const { history } = await openAt('/200/62/75')

    square(62, 75).element().focus()
    await userEvent.keyboard('{Escape}')

    await expectPath(history, '/200')
  })

  test('given focus at the end of a row, when Home is pressed, then focus goes to the row start', async () => {
    await openAt('/200/100/75')

    square(100, 75).element().focus()
    await userEvent.keyboard('{Home}')

    await expect.element(square(12, 75)).toHaveFocus()
  })
})

describe('the colour card', () => {
  test('given a pick, when Copy is pressed, then the value is copied and confirmed', async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)

    await openAt('/200/62/75')

    await page.getByRole('button', { name: 'Copy Hex' }).click()

    expect(writeText).toHaveBeenCalledWith('#4998BF')
    await expect.element(page.getByText('Copied Hex #4998BF')).toBeVisible()
    writeText.mockRestore()
  })

  test('given nothing is picked, then Copy is disabled', async () => {
    await openAt('/200')

    await expect
      .element(page.getByRole('button', { name: 'Copy' }))
      .toBeDisabled()
  })

  test('given a format was chosen, when the app opens again, then it remembers the format', async () => {
    const first = await openAt('/200/62/75')
    await page.getByRole('radio', { name: 'RGB' }).click()
    await expect
      .element(page.getByText('73,152,191', { exact: true }))
      .toBeVisible()
    await first.screen.unmount()

    await openAt('/200/62/75')

    await expect.element(page.getByRole('radio', { name: 'RGB' })).toBeChecked()
  })
})

describe('analytics', () => {
  test('given the app, when pages change, then views are tracked by template', async () => {
    const { history, views } = await openAt('/200')

    await square(62, 75).click()
    await expectPath(history, '/200/62/75')

    expect(views).toEqual([
      { page: '/:hue', params: { hue: '200' } },
      {
        page: '/:hue/:saturation/:brightness',
        params: { brightness: '75', hue: '200', saturation: '62' },
      },
    ])
  })
})
