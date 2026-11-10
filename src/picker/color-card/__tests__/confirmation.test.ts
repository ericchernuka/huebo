import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createConfirmation } from '../confirmation'

const SHOWN_MS = 1800

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function watched() {
  const confirmation = createConfirmation(SHOWN_MS)
  const unsubscribe = confirmation.subscribe(() => undefined)

  return { confirmation, unsubscribe }
}

describe('the copy confirmation', () => {
  test('given a copy, when its time is up, then it goes down still reading what it said', () => {
    const { confirmation } = watched()

    confirmation.show('Copied Hex #4998BF', true)
    vi.advanceTimersByTime(SHOWN_MS)

    expect(confirmation.get()).toEqual({
      copied: true,
      shown: false,
      text: 'Copied Hex #4998BF',
    })
  })

  test('given a confirmation is up, when Copy is pressed again, then it stays up for the full time again', () => {
    const { confirmation } = watched()

    confirmation.show('Copied Hex #4998BF', true)
    vi.advanceTimersByTime(SHOWN_MS - 100)
    confirmation.show('Copied RGB 73,152,191', true)
    vi.advanceTimersByTime(SHOWN_MS - 100)

    expect(confirmation.get()).toEqual({
      copied: true,
      shown: true,
      text: 'Copied RGB 73,152,191',
    })
  })

  test('given nobody is watching any more, when its time would be up, then nothing changes', () => {
    const { confirmation, unsubscribe } = watched()

    confirmation.show("Couldn't copy Hex", false)
    unsubscribe()
    vi.advanceTimersByTime(SHOWN_MS)

    expect(confirmation.get()?.shown).toBe(true)
  })
})
