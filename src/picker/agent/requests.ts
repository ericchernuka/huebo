import * as v from 'valibot'
import {
  colorDistance,
  hexToRgb,
  hsbToHex,
  hsbToRgb,
  rgbToHex,
} from '../../shared/color'
import { FORMATS, textContrast, valuesOf } from '../color-card/formats'
import {
  hueAt,
  HUES,
  STEPS,
  stepAt,
  type Color,
  type Hue,
  type Pick,
  type Step,
} from '../color'
import { describeHue } from '../hue-dial/geometry'

const Level = v.pipe(v.number(), v.minValue(0), v.maxValue(100))

const HEX = /^#?(?:[\da-f]{3}|[\da-f]{6})$/i

/** What `choose_colour` accepts. Unknown keys fail, so a typo can't pass silently. */
export const ChoiceInput = v.strictObject({
  brightness: v.optional(Level),
  clearPick: v.optional(v.boolean()),
  hex: v.optional(
    v.pipe(v.string(), v.regex(HEX, 'hex must look like #3366CC')),
  ),
  hue: v.optional(v.pipe(v.number(), v.finite())),
  saturation: v.optional(Level),
})

export type ChoiceInput = v.InferInput<typeof ChoiceInput>

export const SquaresInput = v.strictObject({
  hue: v.optional(v.pipe(v.number(), v.finite())),
})

export type SquaresInput = v.InferInput<typeof SquaresInput>

export const FormatInput = v.strictObject({ format: v.picklist(FORMATS) })

export type FormatInput = v.InferInput<typeof FormatInput>

/** Parses an agent's arguments, or throws a message the agent can act on. */
export function parseInput<T extends v.GenericSchema>(
  schema: T,
  input: v.InferInput<T>,
): v.InferOutput<T> {
  const result = v.safeParse(schema, input)

  if (!result.success) {
    throw new Error(v.summarize(result.issues))
  }

  return result.output
}

/** A colour an agent asked for, snapped onto Huebo's stops and steps. */
export type Resolved = {
  readonly color: Color
  readonly notes: ReadonlyArray<string>
}

/** The colour an agent's choice makes from `current`, keeping what it left out. */
export function resolveChoice(input: ChoiceInput, current: Color): Resolved {
  if (input.hex !== undefined) {
    return fromHex(input.hex, Object.keys(input).length)
  }

  const changesPick =
    input.clearPick === true ||
    input.saturation !== undefined ||
    input.brightness !== undefined

  if (input.hue === undefined && !changesPick) {
    throw new Error(
      'Nothing to choose. Give a hue, a saturation and brightness, clearPick, or a hex.',
    )
  }

  const notes: Array<string> = []
  const hue = input.hue === undefined ? current.hue : snapHue(input.hue, notes)

  const pick = changesPick
    ? resolvePick(input, current.pick, notes)
    : current.pick

  return { color: { hue, pick }, notes }
}

function snapHue(degrees: number, notes: Array<string>): Hue {
  const hue = hueAt(degrees)

  if (hue !== degrees) {
    notes.push(
      `Hue ${degrees} isn't one of the ${HUES.length} stops, so it's ${hue}.`,
    )
  }

  return hue
}

function resolvePick(
  input: ChoiceInput,
  current: Pick | null,
  notes: Array<string>,
): Pick | null {
  const { brightness, clearPick = false, saturation } = input

  if (clearPick) {
    return clearedPick(input)
  }

  const s = saturation ?? current?.saturation
  const b = brightness ?? current?.brightness

  if (s === undefined || b === undefined) {
    throw new Error(
      'Nothing is picked yet, so give both saturation and brightness.',
    )
  }

  return {
    brightness: snapStep('brightness', b, notes),
    saturation: snapStep('saturation', s, notes),
  }
}

function clearedPick({ brightness, saturation }: ChoiceInput): null {
  if (saturation !== undefined || brightness !== undefined) {
    throw new Error(
      "clearPick can't be combined with saturation or brightness.",
    )
  }

  return null
}

function snapStep(name: string, level: number, notes: Array<string>): Step {
  const step = stepAt(level)

  if (step !== level) {
    notes.push(`${name} ${level} isn't a step, so it's ${step}.`)
  }

  return step
}

/** Every colour Huebo offers. Built per call, so a page with no agent never pays for it. */
function everyColor() {
  return HUES.flatMap(hue =>
    STEPS.flatMap(saturation =>
      STEPS.map(brightness => ({
        color: { hue, pick: { brightness, saturation } },
        rgb: hsbToRgb(hue, saturation, brightness),
      })),
    ),
  )
}

function fromHex(hex: string, keys: number): Resolved {
  if (keys > 1) {
    throw new Error("hex can't be combined with other fields.")
  }

  const target = hexToRgb(hex)

  const nearest = everyColor().reduce((best, next) =>
    colorDistance(next.rgb, target) < colorDistance(best.rgb, target)
      ? next
      : best,
  )

  const { color, rgb } = nearest
  const found = rgbToHex(rgb)
  const asked = rgbToHex(target)

  return {
    color,
    notes:
      found === asked
        ? []
        : [`${asked} isn't on Huebo's grid; the nearest is ${found}.`],
  }
}

/** What an agent reads back about a colour. */
export function report(color: Color, link: string) {
  const values = valuesOf(color)

  return {
    hue: color.hue,
    hueName: describeHue(color.hue),
    link,
    pick: color.pick,
    textContrast:
      values === null
        ? null
        : textContrast(values.rgb).map(({ grade, name, ratio }) => ({
            grade,
            name,
            ratio,
          })),
    values: values?.text ?? null,
  }
}

/**
 * The grid for one hue, brightest row first as on screen, with the text
 * colour that reads best on each square.
 */
export function squaresOf(hue: Hue) {
  return STEPS.toReversed().flatMap(brightness =>
    STEPS.map(saturation => {
      const { grade, name, ratio } = textContrast(
        hsbToRgb(hue, saturation, brightness),
      ).reduce((best, next) =>
        next.exactRatio > best.exactRatio ? next : best,
      )

      return {
        bestText: { grade, name, ratio },
        brightness,
        hex: hsbToHex(hue, saturation, brightness),
        saturation,
      }
    }),
  )
}
