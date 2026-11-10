/**
 * What Copy last said, and whether it's still up. The text stays after it
 * goes down, so the confirmation can fade out still reading it.
 */
export type Confirmation = {
  readonly copied: boolean
  readonly shown: boolean
  readonly text: string
}

export type ConfirmationStore = {
  readonly get: () => Confirmation | null
  /** Puts up `text`, or replaces what's up and restarts its timer. */
  readonly show: (text: string, copied: boolean) => void
  readonly subscribe: (listener: () => void) => () => void
}

/** One confirmation at a time, taken down `shownMs` after the last `show`. */
export function createConfirmation(shownMs: number): ConfirmationStore {
  let current: Confirmation | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  const listeners = new Set<() => void>()

  const set = (next: Confirmation) => {
    current = next

    for (const listener of listeners) {
      listener()
    }
  }

  return {
    get: () => current,
    show: (text, copied) => {
      clearTimeout(timer)
      set({ copied, shown: true, text })
      timer = setTimeout(() => set({ copied, shown: false, text }), shownMs)
    },
    subscribe: listener => {
      listeners.add(listener)

      return () => {
        listeners.delete(listener)

        if (listeners.size === 0) {
          clearTimeout(timer)
        }
      }
    },
  }
}
