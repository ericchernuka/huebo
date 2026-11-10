import { describe, expect, test } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { expectPath, openAt, picked, square } from '../../../__tests__/app'

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
