import { beforeEach } from 'vitest'

// Browser test files share one origin, so a format stored by one file
// would leak into the next one the runner happens to schedule.
beforeEach(() => {
  localStorage.clear()
})
