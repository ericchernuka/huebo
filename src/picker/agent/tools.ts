import { useRouter } from '@tanstack/react-router'
import { useWebMCP } from 'use-webmcp-tool'
import { hueAt, HUES, STEPS, type Color } from '../color'
import { FORMATS, type Format } from '../color-card/formats'
import {
  ChoiceInput,
  FormatInput,
  parseInput,
  report,
  resolveChoice,
  squaresOf,
  SquaresInput,
} from './requests'

const MODEL = `Huebo is an HSB colour picker. A colour is a hue, one of ${HUES.length} stops: ${HUES[0]}, ${HUES[1]} … ${HUES.at(-1)}. Then a pick: a saturation and brightness, each one of the steps ${STEPS.join(', ')}. The link is the only place a colour is kept, so it can be shared.`

const READ_COLOUR = {
  annotations: { readOnlyHint: true },
  description: `${MODEL} Reads the colour on the page: its hue, its pick if one is made, the colour in each format (HSB, RGB and Hex), how white and black text contrast with it, and its link.`,
  inputSchema: { properties: {}, type: 'object' },
  name: 'read_colour',
}

const LEVEL = { maximum: 100, minimum: 0, type: 'number' } as const

const CHOOSE_COLOUR = {
  description: `${MODEL} Chooses a colour as a person would with the dial and grid. Each call is one entry in the browser's history, so Back undoes it. Give a hex on its own to jump to Huebo's nearest colour, or any of hue, saturation and brightness to change just those and keep the rest. Values between stops or steps snap to the nearest, and the notes say when they did. clearPick leaves only the hue. Returns the colour now chosen, as read_colour does.`,
  inputSchema: {
    additionalProperties: false,
    properties: {
      brightness: { ...LEVEL, description: 'Snapped to the nearest step.' },
      clearPick: {
        description: 'Clear the pick, leaving only the hue.',
        type: 'boolean',
      },
      hex: {
        description: "A colour such as #3366CC, matched to Huebo's nearest.",
        pattern: '^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
        type: 'string',
      },
      hue: {
        description:
          'Degrees around the colour circle, snapped to the nearest stop and wrapped into 0–355.',
        type: 'number',
      },
      saturation: { ...LEVEL, description: 'Snapped to the nearest step.' },
    },
    type: 'object',
  },
  name: 'choose_colour',
}

const LIST_SQUARES = {
  annotations: { readOnlyHint: true },
  description: `${MODEL} Lists the 64 squares of the grid for a hue without choosing anything, brightest row first: each pick's hex, and the text colour (white or black) that reads best on it with its WCAG contrast. Use it to compare picks before choosing one.`,
  inputSchema: {
    additionalProperties: false,
    properties: {
      hue: {
        description:
          'Degrees, snapped to the nearest stop. Defaults to the hue on the page.',
        type: 'number',
      },
    },
    type: 'object',
  },
  name: 'list_squares',
}

/**
 * The page's colour tools for agents. `link` is the colour in the link, and
 * `choose` makes an agent's choice the way a person's is made.
 */
export function useColourTools(
  link: Color,
  choose: (color: Color) => void,
): void {
  const router = useRouter()

  const linkTo = (color: Color) =>
    new URL(
      router.buildLocation({
        params: color,
        to: '/$hue/{-$saturation}/{-$brightness}',
      }).href,
      globalThis.location.origin,
    ).href

  useWebMCP({ ...READ_COLOUR, execute: () => report(link, linkTo(link)) })

  useWebMCP<ChoiceInput>({
    ...CHOOSE_COLOUR,
    execute: input => {
      const { color, notes } = resolveChoice(
        parseInput(ChoiceInput, input),
        link,
      )

      choose(color)

      return { ...report(color, linkTo(color)), notes }
    },
  })

  useWebMCP<SquaresInput>({
    ...LIST_SQUARES,
    execute: input => {
      const { hue = link.hue } = parseInput(SquaresInput, input)

      return { hue: hueAt(hue), squares: squaresOf(hueAt(hue)) }
    },
  })
}

const CHOOSE_FORMAT = {
  description: `Chooses the format Huebo's colour card shows first and Copy writes: ${FORMATS.join(', ')}. It's remembered on this device. Returns the colour in that format, if one is picked.`,
  inputSchema: {
    additionalProperties: false,
    properties: { format: { enum: FORMATS, type: 'string' } },
    required: ['format'],
    type: 'object',
  },
  name: 'choose_format',
}

/** The card's format tool. `text` is the colour in each format, once picked. */
export function useFormatTool(
  choose: (format: Format) => void,
  text: Readonly<Record<Format, string>> | null,
): void {
  useWebMCP<FormatInput>({
    ...CHOOSE_FORMAT,
    execute: input => {
      const { format } = parseInput(FormatInput, input)

      choose(format)

      return { format, value: text?.[format] ?? null }
    },
  })
}
