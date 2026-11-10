const VELOCITY_KEPT_PER_MS = 0.9975

const FLICK_GAIN = 1.5

const MIN_FLICK_DEG_PER_MS = 0.04

const STOP_DEG_PER_MS = 0.008

const WINDOW_MS = 80

const STALE_MS = 60

const NEWEST_ALWAYS_KEPT = 2

export type Sample = { readonly time: number; readonly x: number }

export type Coast = { readonly turn: number; readonly velocity: number }

export function recordSample(
  samples: ReadonlyArray<Sample>,
  sample: Sample,
): Array<Sample> {
  return [...samples, sample].filter(
    (kept, index, all) =>
      index >= all.length - NEWEST_ALWAYS_KEPT ||
      sample.time - kept.time <= WINDOW_MS,
  )
}

/**
 * The turn velocity, in degrees per ms, of a wheel of `radius` px released at
 * `releaseTime`, or null when the release is a placement rather than a
 * flick. Dragging left turns the wheel forward, so velocity is positive.
 */
export function flickVelocity(
  samples: ReadonlyArray<Sample>,
  releaseTime: number,
  radius: number,
): number | null {
  const first = samples.at(0)
  const last = samples.at(-1)

  if (
    !first ||
    !last ||
    releaseTime - last.time > STALE_MS ||
    releaseTime <= first.time
  ) {
    return null
  }

  const velocity =
    (-(last.x - first.x) / (releaseTime - first.time) / radius) *
    (180 / Math.PI) *
    FLICK_GAIN

  return Math.abs(velocity) > MIN_FLICK_DEG_PER_MS ? velocity : null
}

/** Advances a coasting wheel by `elapsed` ms, or returns null once it has stopped. */
export function coast(state: Coast, elapsed: number): Coast | null {
  const velocity = state.velocity * VELOCITY_KEPT_PER_MS ** elapsed

  if (Math.abs(velocity) < STOP_DEG_PER_MS) {
    return null
  }

  return { turn: state.turn + state.velocity * elapsed, velocity }
}
