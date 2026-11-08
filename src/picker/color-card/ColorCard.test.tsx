import { beforeEach, describe, expect, test, vi } from 'vitest'
import { page } from 'vitest/browser'
import { openAt } from '../../test/app'

beforeEach(() => {
  localStorage.clear()
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
