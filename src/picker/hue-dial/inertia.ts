/** Velocity kept per millisecond while coasting. A hard flick travels about 200°. */
const FRICTION = 0.9975

/** Makes a flick feel a little livelier than the finger's own speed. */
const FLICK_GAIN = 1.5

/** In degrees per ms. A release slower than this is a placement, not a flick. */
const MIN_FLICK = 0.04

/** In degrees per ms. Below this, a coasting wheel has stopped. */
const STOP = 0.008

/** Only the last stretch of a drag counts towards the release velocity. */
const WINDOW_MS = 80

/** A finger that paused this long before lifting has no velocity left. */
const STALE_MS = 60

export type Sample = { readonly time: number; readonly x: number }

export type Coast = { readonly turn: number; readonly velocity: number }

/** Keeps the samples a release velocity needs: the newest, plus the last 80ms. */
export function recordSample(
  samples: ReadonlyArray<Sample>,
  sample: Sample,
): Array<Sample> {
  return [...samples, sample].filter(
    (kept, index, all) =>
      index >= all.length - 2 || sample.time - kept.time <= WINDOW_MS,
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

  return Math.abs(velocity) > MIN_FLICK ? velocity : null
}

/** Advances a coasting wheel by `elapsed` ms, or returns null once it has stopped. */
export function coast(state: Coast, elapsed: number): Coast | null {
  const velocity = state.velocity * FRICTION ** elapsed

  if (Math.abs(velocity) < STOP) {
    return null
  }

  return { turn: state.turn + state.velocity * elapsed, velocity }
}
