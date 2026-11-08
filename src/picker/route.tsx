import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../root-route'
import { colorPath, parseColorPath, type Color } from './color'
import { Picker } from './Picker'

/**
 * The only page. Valibot parses the path into a Color here, and nothing
 * below this seam checks validity again. A path that doesn't parse doesn't
 * match, so it falls through to the root's redirect.
 */
export const pickerRoute = createRoute({
  component: Picker,
  getParentRoute: () => rootRoute,
  onEnter: match =>
    match.context.analytics.trackPageView(pageView(match.params)),
  onStay: match =>
    match.context.analytics.trackPageView(pageView(match.params)),
  params: {
    parse: raw => parseColorPath(raw) ?? false,
    stringify: colorPath,
  },
  path: '$hue/{-$saturation}/{-$brightness}',
})

function pageView(color: Color) {
  return {
    page: color.pick === null ? '/:hue' : '/:hue/:saturation/:brightness',
    params: colorPath(color),
  }
}
