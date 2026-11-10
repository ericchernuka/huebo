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

const FLICK_STEP_PX = 4

const FLICK_STEP_MS = 5

const FLICK_STEPS = 6

/**
 * Longer than a gentle flick coasts. The first test below fails if a coast
 * ever outlasts it, so the tests that wait on it can't pass by waiting too
 * little.
 */
const COAST_REST_MS = 1500

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** A short, gentle flick left, so the wheel coasts forward for about a second. */
function flickWheel() {
  const wheel = hueSlider().element()
  const y = wheel.getBoundingClientRect().top + 20
  const startX = 300

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

  send('pointerdown', startX)

  return new Promise<void>(resolve => {
    for (let step = 1; step <= FLICK_STEPS; step++) {
      setTimeout(
        () => send('pointermove', startX - step * FLICK_STEP_PX),
        step * FLICK_STEP_MS,
      )
    }

    setTimeout(
      () => {
        send('pointerup', startX - FLICK_STEPS * FLICK_STEP_PX)
        resolve()
      },
      (FLICK_STEPS + 1) * FLICK_STEP_MS,
    )
  })
}

async function flickAndCoast(from: string) {
  await flickWheel()
  await expect.poll(() => hueSlider().element().ariaValueNow).not.toBe(from)
}

const restAfterCoast = () => sleep(COAST_REST_MS)

describe('the phone wheel', () => {
  test('given a flick, when the wheel is left alone, then it coasts and lands once, before the others stop waiting', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickAndCoast('200')
    await expect
      .poll(() => history.location.pathname, { timeout: COAST_REST_MS })
      .not.toBe('/200')

    expect(history.location.pathname).toBe(
      `/${hueSlider().element().ariaValueNow}`,
    )
    expect(history.length).toBe(2)
  })

  test('given a coasting wheel, when a square is picked, then the pick stays once the wheel would have come to rest', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickAndCoast('200')
    await square(62, 75).click()
    await restAfterCoast()

    expect(history.location.pathname).toMatch(/^\/\d+\/62\/75$/)
    await expect.element(picked()).toBeInTheDocument()
  })

  test('given a coasting wheel, when an arrow key goes down, then the wheel stops where the key put it', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickAndCoast('200')
    hueSlider().element().focus()
    await userEvent.keyboard('{ArrowRight>}')
    const stepped = hueSlider().element().ariaValueNow

    await sleep(300)

    expect(hueSlider().element().ariaValueNow).toBe(stepped)
    await userEvent.keyboard('{/ArrowRight}')
    await expectPath(history, `/${stepped}`)
  })

  test('given a focused, coasting wheel, when a square is picked, then the pick is the only history entry', async () => {
    const { history } = await openAt('/200', PHONE)

    hueSlider().element().focus()
    await flickAndCoast('200')
    await square(62, 75).click()
    await restAfterCoast()

    expect(history.length).toBe(2)
    history.back()
    await expectPath(history, '/200')
  })

  test('given a focused, coasting wheel, when + is pressed, then the step is the only history entry', async () => {
    const { history } = await openAt('/200', PHONE)

    hueSlider().element().focus()
    await flickAndCoast('200')
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
    await flickAndCoast('105')
    history.back()
    await expectPath(history, '/100')
    await restAfterCoast()

    expect(history.location.pathname).toBe('/100')
    await expect.element(hueSlider()).toHaveAttribute('aria-valuenow', '100')
  })

  test('given a coasting wheel, when the screen widens to the ring, then the coast still lands and the URL matches the dial', async () => {
    const { history } = await openAt('/200', PHONE)

    await flickAndCoast('200')
    await page.viewport(1280, 900)

    await expect
      .poll(() => history.location.pathname, { timeout: COAST_REST_MS })
      .not.toBe('/200')
    expect(history.location.pathname).toBe(
      `/${hueSlider().element().ariaValueNow}`,
    )
  })
})
