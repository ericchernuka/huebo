import { describe, expect, test } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { expectPath, hueSlider, openAt } from '../../../__tests__/app'

function scrollRing(notches: number) {
  for (let notch = 0; notch < notches; notch++) {
    hueSlider()
      .element()
      .dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 1 }),
      )
  }
}

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
    const { history } = await openAt('/200')

    hueSlider().element().focus()
    await userEvent.keyboard('{ArrowRight>6}')

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '230')
    expect(history.location.pathname).toBe('/200')

    await userEvent.keyboard('{/ArrowRight}')

    await expectPath(history, '/230')
    expect(history.length).toBe(2)
    history.back()
    await expectPath(history, '/200')
    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '200')
  })

  test('given the dial has focus at 0, when Home is pressed, then no history entry is added', async () => {
    const { history } = await openAt('/0')

    hueSlider().element().focus()
    await userEvent.keyboard('{Home}')

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '0')
    expect(history.length).toBe(1)
  })

  test('given the ring at 200, when the mouse wheel scrolls three notches, then the hue turns live and history gets one entry', async () => {
    const { history } = await openAt('/200')
    scrollRing(3)

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '215')
    expect(history.location.pathname).toBe('/200')

    await expectPath(history, '/215')
    expect(history.length).toBe(2)
  })

  test('given hue 200, when the page opens, then the dial names it in words', async () => {
    await openAt('/200')

    await expect
      .element(hueSlider())
      .toHaveAttribute('aria-valuetext', '200 degrees, azure')
  })
})

describe('the mouse wheel', () => {
  test('given a scroll waiting for its pause, when an arrow key steps, then the key wins and the pause adds nothing', async () => {
    const { history } = await openAt('/200')
    scrollRing(3)

    hueSlider().element().focus()
    await userEvent.keyboard('{ArrowRight}')
    await expectPath(history, '/220')
    await new Promise(resolve => setTimeout(resolve, 400))

    expect(history.location.pathname).toBe('/220')
    expect(history.length).toBe(2)
  })
})
