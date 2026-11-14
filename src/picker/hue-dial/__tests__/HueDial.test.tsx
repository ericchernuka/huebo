import { describe, expect, test } from 'vitest'
import { commands, page, userEvent } from 'vitest/browser'
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

const easing = () => ({
  page: getComputedStyle(document.documentElement).transitionDuration,
  thumb: getComputedStyle(
    hueSlider().element().querySelector('g[style]') ?? document.body,
  ).transitionDuration,
})

describe('dragging the ring', () => {
  test('given the ring at 200, when a pointer drags it, then the page and thumb follow without easing and history gets one entry', async () => {
    const { history } = await openAt('/200')
    await commands.ringPointer('down', 90)
    await commands.ringPointer('move', 120)

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '120')
    expect(easing()).toEqual({ page: '0s', thumb: '0s' })
    expect(history.location.pathname).toBe('/200')

    await commands.ringPointer('up', 120)

    await expectPath(history, '/120')
    expect(history.length).toBe(2)
    expect(easing()).toEqual({ page: '0.5s', thumb: '0.18s' })
  })

  test('given the ring at 200, when a pointer drags it, then the dial takes focus without showing the focus ring', async () => {
    await openAt('/200')
    await commands.ringPointer('down', 90)
    await commands.ringPointer('up', 90)

    await expect.element(hueSlider()).toHaveFocus()
    expect(hueSlider().element().matches(':focus-visible')).toBe(false)
  })

  test('given the dial has focus, when an arrow key is held, then the thumb still eases', async () => {
    await openAt('/200')

    hueSlider().element().focus()
    await userEvent.keyboard('{ArrowRight>3}')

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '215')
    expect(easing()).toEqual({ page: '0.5s', thumb: '0.18s' })

    await userEvent.keyboard('{/ArrowRight}')
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
