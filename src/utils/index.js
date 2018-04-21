import { INCREMENTS, MIN_HUE, MAX_HUE } from '../constants'
import { hsb2Hex } from './color_utils'

/**
 * Noop
 */
export function noop() {}

/**
 * Calls all functions with the same arguments
 * @param {Functions} fns
 */
export const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args))

/**
 * Builds HSB increments based off a single hue value.
 * @param {Number} hue Hue value between 0 and 355
 */
export const buildHueIncrements = (hue = 60) => {
  if (MIN_HUE < 0 || MAX_HUE > 355) {
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
