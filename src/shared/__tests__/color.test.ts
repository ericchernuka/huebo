import { expect, test } from 'vitest'
import {
  colorDistance,
  contrastRatio,
  hexToRgb,
  hsbToHex,
  hsbToRgb,
  rgbToHex,
} from '../color'
import goldenFile from './hsb-golden.txt?raw'

const STEPS = [12, 25, 38, 50, 62, 75, 88, 100]

const golden = goldenFile
  .split('\n')
  .filter(line => line !== '' && !line.startsWith('#'))

test('given any of the 72 × 64 shareable colours, when converted, then the hex matches the original Huebo', () => {
  const current = golden.map(line => {
    const hue = Number(line.split(' ')[0])

    const hexes = STEPS.flatMap(brightness =>
      STEPS.map(saturation => hsbToHex(hue, saturation, brightness).slice(1)),
    )

    return `${hue} ${hexes.join(' ')}`
  })

  expect(golden).toHaveLength(72)
  expect(current).toEqual(golden)
})

test('given the colour from a shared link to /200/62/75, when converted, then it is #4998BF and rgb 73,152,191', () => {
  expect(hsbToHex(200, 62, 75)).toBe('#4998BF')
  expect(hsbToRgb(200, 62, 75)).toEqual([73, 152, 191])
})

test('given black and white, when compared, then the contrast is the WCAG maximum of 21', () => {
  expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBe(21)
  expect(contrastRatio([255, 255, 255], [0, 0, 0])).toBe(21)
})

test('given Hex in any of its spellings, when read and written back, then it is upper-case with six digits', () => {
  expect(
    ['#4998bf', '4998BF', '#fff'].map(hex => rgbToHex(hexToRgb(hex))),
  ).toEqual(['#4998BF', '#4998BF', '#FFFFFF'])
})

test('given a colour, then a near shade is closer to it than a far one, and it is no distance from itself', () => {
  const orange = hexToRgb('#FF8800')

  expect(colorDistance(orange, orange)).toBe(0)
  expect(colorDistance(orange, hexToRgb('#FF8000'))).toBeLessThan(
    colorDistance(orange, hexToRgb('#FF0000')),
  )
})
