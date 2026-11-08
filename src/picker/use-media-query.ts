import { useSyncExternalStore } from 'react'

/** Whether `query` matches now, re-rendering whenever that changes. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const list = matchMedia(query)

      list.addEventListener('change', onChange)

      return () => list.removeEventListener('change', onChange)
    },
    () => matchMedia(query).matches,
  )
}
