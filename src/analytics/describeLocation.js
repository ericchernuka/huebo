import { matchPath } from 'react-router-dom'
import { HUE_PATHS, toTemplate } from '../routes'

/**
 * Describes a pathname for analytics: the route template (stable across
 * colors) plus the concrete params. Returns null for paths that aren't pages.
 */
export function describeLocation(pathname) {
  const match = matchPath(pathname, { exact: true, path: HUE_PATHS })

  if (!match) {
    return null
  }

  const { brightness, hue, saturation } = match.params

  return {
    page: toTemplate(match.path),
    params: { brightness, hue, saturation },
  }
}
