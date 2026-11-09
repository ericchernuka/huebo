import { describe, expect, test } from 'vitest'
import { page } from 'vitest/browser'
import { expectPath, hueSlider, openAt, picked, square } from './test/app'

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

describe('the page', () => {
  test('given a hue, then the whole page, root included, takes its background and does not rubber-band', async () => {
    await openAt('/200/62/75')

    const root = getComputedStyle(document.documentElement)

    await expect.poll(() => root.backgroundColor).toBe('rgb(202, 220, 230)')
    expect(root.overscrollBehaviorY).toBe('none')
  })
})
