import { expect, test } from 'vitest'
import { contrastRatio, hsbToHex, hsbToRgb } from './color'
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
