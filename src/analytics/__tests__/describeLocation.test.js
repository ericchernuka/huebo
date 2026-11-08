import { expect, test } from 'vitest'
import { describeLocation } from '../describeLocation'

test('describes a full color path as a template plus params', () => {
  expect(describeLocation('/120/50/88')).toEqual({
    page: '/:hue/:saturation/:brightness',
    params: { brightness: '88', hue: '120', saturation: '50' },
  })
})

test('describes a hue-only path with its own template', () => {
  expect(describeLocation('/60')).toEqual({
    page: '/:hue',
    params: { brightness: undefined, hue: '60', saturation: undefined },
  })
})

test.each(['/', '/not-a-route', '/400', '/60/50'])('returns null for %s', pathname => {
  expect(describeLocation(pathname)).toBeNull()
})
