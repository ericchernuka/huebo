import { afterEach, describe, expect, test, vi } from 'vitest'
import { page } from 'vitest/browser'
import { openAt } from '../../../__tests__/app'

const copyButton = (format: string) =>
  page.getByRole('button', { name: `Copy ${format}` })

const showsTick = (format: string) =>
  copyButton(format).element().querySelector('svg') !== null

afterEach(() => {
  vi.restoreAllMocks()
})

describe('the colour card', () => {
  test('given a pick, when Copy is pressed, then the value is on the clipboard and confirmed', async () => {
    await openAt('/200/62/75')

    await copyButton('Hex').click()

    await expect.poll(() => navigator.clipboard.readText()).toBe('#4998BF')
    await expect.element(page.getByText('Copied Hex #4998BF')).toBeVisible()
    expect(showsTick('Hex')).toBe(true)
  })

  test('given a confirmation is up, when Copy is pressed again, then the same confirmation stays up rather than a new one popping', async () => {
    await openAt('/200/62/75')

    const confirmation = page.getByText('Copied Hex #4998BF')

    await copyButton('Hex').click()
    await expect.element(confirmation).toBeVisible()
    const first = confirmation.element()

    await copyButton('Hex').click()
    await copyButton('Hex').click()

    await expect.element(confirmation).toBeVisible()
    expect(confirmation.element()).toBe(first)
    expect(confirmation.elements()).toHaveLength(1)
  })

  test('given the clipboard refuses, when Copy is pressed, then it says so and shows no tick', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('Denied'),
    )

    await openAt('/200/62/75')
    await copyButton('Hex').click()

    await expect.element(page.getByText("Couldn't copy Hex")).toBeVisible()
    expect(showsTick('Hex')).toBe(false)
  })

  test('given a format is chosen, when Copy is pressed, then the clipboard gets that format', async () => {
    await openAt('/200/62/75')

    await page.getByRole('radio', { name: 'HSB' }).click()
    await copyButton('HSB').click()

    await expect.poll(() => navigator.clipboard.readText()).toBe('200,62,75')
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
