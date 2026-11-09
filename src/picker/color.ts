import * as v from 'valibot'

export const STEPS = [12, 25, 38, 50, 62, 75, 88, 100] as const

export type Step = (typeof STEPS)[number]

const HueNumber = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(355),
  v.multipleOf(5),
  v.brand('Hue'),
)

/** A hue in degrees: a multiple of 5 from 0 to 355, so one of 72 stops. */
export type Hue = v.InferOutput<typeof HueNumber>

export type Pick = { readonly brightness: Step; readonly saturation: Step }

export type Color = { readonly hue: Hue; readonly pick: Pick | null }

export const DEFAULT_HUE = hueAt(60)

/** Rounds any angle to the nearest stop and wraps it into 0–355. */
export function hueAt(degrees: number): Hue {
  const stop = Math.round(degrees / 5) * 5

  return v.parse(HueNumber, ((stop % 360) + 360) % 360)
}

const HueParam = v.pipe(
  v.string(),
  v.regex(/^\d{1,3}$/),
  v.toNumber(),
  HueNumber,
)

const StepParam = v.pipe(
  v.picklist(STEPS.map(String)),
  v.toNumber(),
  v.picklist(STEPS),
)

const ColorParams = v.union([
  v.pipe(
    v.object({ brightness: StepParam, hue: HueParam, saturation: StepParam }),
    v.transform(({ brightness, hue, saturation }): Color => ({
      hue,
      pick: { brightness, saturation },
    })),
  ),
  v.pipe(
    v.object({
      brightness: v.optional(v.undefined()),
      hue: HueParam,
      saturation: v.optional(v.undefined()),
    }),
    v.transform(({ hue }): Color => ({ hue, pick: null })),
  ),
])

export type ColorPath = {
  brightness?: string | undefined
  hue: string
  saturation?: string | undefined
}

/**
 * Parses URL params into a Color: `/60` or `/200/62/75`. Anything else,
 * including a saturation without a brightness, gives null.
 */
export function parseColorPath(raw: ColorPath): Color | null {
  const result = v.safeParse(ColorParams, raw)

  return result.success ? result.output : null
}

export function colorPath(color: Color): ColorPath {
  return {
    brightness: color.pick === null ? undefined : String(color.pick.brightness),
    hue: String(color.hue),
    saturation: color.pick === null ? undefined : String(color.pick.saturation),
  }
}
