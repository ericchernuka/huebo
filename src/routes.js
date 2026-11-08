import { INCREMENTS } from './constants'

const incrementOptions = INCREMENTS.join('|')
const hueRange = '[0-2]?[0-9]?[0-9]|3[0-4][0-9]|35[0-5]'

const hue = `:hue(${hueRange})`
const increment = name => `:${name}(${incrementOptions})`

export const HUE_PATHS = [
  `/${hue}/${increment('saturation')}/${increment('brightness')}`,
  `/${hue}`,
]

/** A route pattern without its param constraints, e.g. `/:hue`. */
export const toTemplate = path => path.replaceAll(/\([^)]*\)/g, '')
