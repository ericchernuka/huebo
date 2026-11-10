import { describe, expect, test } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import {
  expectPath,
  hueSlider,
  openAt,
  PHONE,
  picked,
  square,
} from '../../../__tests__/app'

function flickWheel() {
  const wheel = hueSlider().element()
  const y = wheel.getBoundingClientRect().top + 20

  const send = (type: string, x: number) =>
    wheel.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        buttons: 1,
        clientX: x,
        clientY: y,
        isPrimary: true,
        pointerId: 1,
      }),
    )

  send('pointerdown', 300)

  return new Promise<void>(resolve => {
    for (const [index, x] of [280, 260, 240, 220, 200].entries()) {
      setTimeout(() => send('pointermove', x), 4 * (index + 1))
    }

    setTimeout(() => {
      send('pointerup', 200)
      resolve()
    }, 20)
  })
}

const restAfterCoast = () => new Promise(resolve => setTimeout(resolve, 2600))

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
    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '200')
  })

  test('given the dial has focus at 0, when Home is pressed, then no history entry is added', async () => {
    const { history, views } = await openAt('/0')

    hueSlider().element().focus()
    await userEvent.keyboard('{Home}')

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '0')
    expect(views).toHaveLength(1)
    expect(history.length).toBe(1)
  })

  test('given the ring at 200, when the mouse wheel scrolls three notches, then the hue turns live and history gets one entry', async () => {
    const { history, views } = await openAt('/200')
    const ring = hueSlider().element()

    for (let notch = 0; notch < 3; notch++) {
      ring.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 1 }),
      )
    }

    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '215')
    expect(history.location.pathname).toBe('/200')

    await expectPath(history, '/215')
    expect(views).toHaveLength(2)
  })

  test('given a turn, then the dial describes the hue', async () => {
    await openAt('/200')

    await expect
      .element(hueSlider())
      .toHaveAttribute('aria-valuetext', '200 degrees, azure')
  })
})

describe('the phone wheel', () => {
  test('given a coasting wheel, when a square is picked, then the pick stays once the wheel would have come to rest', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickWheel()
    await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe('200')
    await square(62, 75).click()
    await restAfterCoast()

    expect(history.location.pathname).toMatch(/^\/\d+\/62\/75$/)
    await expect.element(picked()).toBeInTheDocument()
  })

  test('given a coasting wheel, when an arrow key goes down, then the wheel stops where the key put it', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickWheel()
    await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe('200')
    hueSlider().element().focus()
    await userEvent.keyboard('{ArrowRight>}')
    const stepped = hueSlider().element().ariaValueNow

    await new Promise(resolve => setTimeout(resolve, 300))

    expect(hueSlider().element().ariaValueNow).toBe(stepped)
    await userEvent.keyboard('{/ArrowRight}')
    await expectPath(history, `/${stepped}`)
  })

  test('given a focused, coasting wheel, when a square is picked, then the pick is the only history entry', async () => {
    const { history } = await openAt('/200', PHONE)

    hueSlider().element().focus()
    await flickWheel()
    await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe('200')
    await square(62, 75).click()
    await restAfterCoast()

    expect(history.length).toBe(2)
    history.back()
    await expectPath(history, '/200')
  })

  test('given a focused, coasting wheel, when + is pressed, then the step is the only history entry', async () => {
    const { history } = await openAt('/200', PHONE)

    hueSlider().element().focus()
    await flickWheel()
    await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe('200')
    await page
      .getByRole('button', { name: 'Increase hue by 5 degrees' })
      .click()

    const stepped = hueSlider().element().ariaValueNow

    await restAfterCoast()

    expect(history.length).toBe(2)
    expect(history.location.pathname).toBe(`/${stepped}`)
  })

  test('given a coasting wheel, when the viewer goes Back, then the coast stops and Back holds', async () => {
    const { history } = await openAt('/100', PHONE)

    await page
      .getByRole('button', { name: 'Increase hue by 5 degrees' })
      .click()
    await expectPath(history, '/105')
    await flickWheel()
    await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe('105')
    history.back()
    await expectPath(history, '/100')
    await restAfterCoast()

    expect(history.location.pathname).toBe('/100')
    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '100')
  })

  test('given a coasting wheel, when the screen widens to the ring, then the coast still lands and the URL matches the dial', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickWheel()
    await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe('200')
    await page.viewport(1280, 900)
    await restAfterCoast()

    const shown = hueSlider().element().ariaValueNow

    expect(shown).not.toBe('200')
    expect(history.location.pathname).toBe(`/${shown}`)
  })
})

describe('the mouse wheel', () => {
  test('given a scroll waiting for its pause, when an arrow key steps, then the key wins and the pause adds nothing', async () => {
    const { history, views } = await openAt('/200')
    const ring = hueSlider().element()

    for (let notch = 0; notch < 3; notch++) {
      ring.dispatchEvent(
        new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 1 }),
      )
    }

    ring.focus()
    await userEvent.keyboard('{ArrowRight}')
    await expectPath(history, '/220')
    await new Promise(resolve => setTimeout(resolve, 400))

    expect(history.location.pathname).toBe('/220')
    expect(views).toHaveLength(2)
  })
})
