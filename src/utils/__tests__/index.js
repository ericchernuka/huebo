import { buildHueIncrements, extractHSBValuesFromParams } from '../index'

describe('buildHueIncrements()', () => {
  test('defaults to a hue of 60', () => {
    const result = buildHueIncrements()
    result.forEach(hsb => {
      expect(hsb.hue).toEqual(60)
    })
  })

  test('builds hue increments based on a passed in hue', () => {
    const hue = 14
    const result = buildHueIncrements(hue)
    result.forEach(hsb => {
      expect(hsb.hue).toEqual(hue)
    })
  })

  test('throws an error if the value is not within 0-355', () => {
    const belowRange = () => buildHueIncrements(-1)
    const aboveRange = () => buildHueIncrements(356)

    expect(belowRange).toThrowError(/between 0 and 355/)
    expect(aboveRange).toThrowError(/between 0 and 355/)
  })
})

describe('extractHSBValuesFromParams()', () => {
  it('converts all url params to numbers', () => {
    const params = { hue: '60', saturation: '10', brightness: '10' }
    expect(extractHSBValuesFromParams(params)).toEqual({
      hue: 60,
      saturation: 10,
      brightness: 10,
    })
  })

  it('returns null if a value cant be coerced to a number', () => {
    const params = { hue: '60', saturation: '10', brightness: '10', foo: 'bar' }
    expect(extractHSBValuesFromParams(params)).toEqual({
      hue: 60,
      saturation: 10,
      brightness: 10,
      foo: null,
    })
  })
})
