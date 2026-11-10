import { describe, expect, test } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { openAt } from '../../__tests__/app'

const help = () => page.getByRole('button', { name: 'Help' })
const dialog = () => page.getByRole('dialog', { name: 'Picking a colour' })

describe('help', () => {
  test('given help is shut, when Help is pressed, then the help opens with focus inside it', async () => {
    await openAt('/200')

    await help().click()

    await expect.element(dialog()).toBeVisible()
    await expect.element(help()).toHaveAttribute('aria-haspopup', 'dialog')
    expect(document.activeElement).toBe(
      page.getByRole('link', { name: /^Louie Mantia/ }).element(),
    )
  })

  test('given help is open, when Escape is pressed, then it shuts and focus is back on Help', async () => {
    await openAt('/200')
    await help().click()
    await expect.element(dialog()).toBeVisible()

    await userEvent.keyboard('{Escape}')

    await expect.element(dialog()).not.toBeInTheDocument()
    expect(document.activeElement).toBe(help().element())
  })

  test('given help is open, when the page outside it is clicked, then it shuts and focus is back on Help', async () => {
    await openAt('/200')
    await help().click()
    await expect.element(dialog()).toBeVisible()

    await page.getByRole('heading', { name: 'Huebo' }).click()

    await expect.element(dialog()).not.toBeInTheDocument()
    expect(document.activeElement).toBe(help().element())
  })

  test('given help is open, when focus tabs out of it, then it shuts', async () => {
    await openAt('/200')
    await help().click()
    await expect.element(dialog()).toBeVisible()

    await userEvent.tab()

    await expect.element(dialog()).not.toBeInTheDocument()
  })

  test('given help is open, when Help is pressed again, then it shuts', async () => {
    await openAt('/200')
    await help().click()
    await expect.element(dialog()).toBeVisible()

    await help().click()

    await expect.element(dialog()).not.toBeInTheDocument()
  })
})
