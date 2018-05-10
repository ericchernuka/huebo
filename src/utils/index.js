import { INCREMENTS, MIN_HUE, MAX_HUE } from '../constants'
import { hsb2Hex } from './color_utils'

/**
 * Builds HSB increments based off a single hue value.
 * @param {Number} hue Hue value between 0 and 355
 */
export const buildHueIncrements = (hue = 60) => {
  if (hue < MIN_HUE || hue > MAX_HUE) {
    throw new Error('Hue value must be between 0 and 355')
  }

  return INCREMENTS.reduce((acc, brightness) => {
    INCREMENTS.forEach(saturation => {
      acc.push({
        hue,
        saturation,
        brightness,
        hex: hsb2Hex(hue, saturation, brightness),
      })
    })

    return acc
  }, [])
}

/**
 * Debounce a method for a defined amount of milliseconds
 * @param {Function} fn Callback that needs to be debounced
 * @param {Number} timeMs Amount of milliseconds to wait before calling
 */
export const debounce = (fn, timeMs) => {
  let timeout

  return function() {
    const functionCall = () => fn.apply(this, arguments)

    clearTimeout(timeout)
    timeout = setTimeout(functionCall, timeMs)
  }
}
