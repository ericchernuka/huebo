import { describe, expect, test, vi } from 'vitest'
import { page } from 'vitest/browser'
import { openAt } from '../../../__tests__/app'

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

  test('given a confirmation is up, when Copy is pressed again, then the same confirmation stays up rather than a new one popping', async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)

    await openAt('/200/62/75')

    const copy = page.getByRole('button', { name: 'Copy Hex' })
    const confirmation = page.getByText('Copied Hex #4998BF')

    await copy.click()
    await expect.element(confirmation).toBeVisible()
    const first = confirmation.element()

    await copy.click()
    await copy.click()
    await expect.poll(() => writeText.mock.calls.length).toBe(3)

    expect(confirmation.element()).toBe(first)
    expect(confirmation.elements()).toHaveLength(1)
    writeText.mockRestore()
  })

  test('given the clipboard refuses, when Copy is pressed, then it says so and shows no tick', async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(new Error('Denied'))

    await openAt('/200/62/75')
    await page.getByRole('button', { name: 'Copy Hex' }).click()

    await expect.element(page.getByText("Couldn't copy Hex")).toBeVisible()
    expect(document.querySelector('button svg')).toBeNull()
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
