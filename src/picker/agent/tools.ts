import { useWebMCP } from 'use-webmcp-tool'
import { hueAt, HUES, linkPath, STEPS, type Color } from '../color'
import { FORMATS, type Format } from '../formats'
import {
  ChoiceInput,
  FormatInput,
  parseInput,
  report,
  resolveChoice,
  squaresOf,
  SquaresInput,
} from './requests'

const MODEL = `A colour in Huebo, an HSB colour picker, is a hue, one of ${HUES.length} stops (${HUES[0]}, ${HUES[1]} … ${HUES.at(-1)}), plus a pick when one is made: a saturation and brightness, each one of the steps ${STEPS.join(', ')}.`

const READ_COLOUR = {
  annotations: { readOnlyHint: true },
  description: `Reads the colour on the page: its hue, its pick if one is made, the colour in each format (HSB, RGB and Hex), how white and black text contrast with it, and its link. The link is the only place a colour is kept, so share that.`,
  inputSchema: { properties: {}, type: 'object' },
  name: 'read_colour',
}

const STEP_INPUT = { maximum: 100, minimum: 0, type: 'number' } as const

const CHOOSE_COLOUR = {
  description: `Chooses a colour as a person would with the dial and grid. ${MODEL} Each call is one entry in the browser's history, so Back undoes it. Give a hex alone, or any of hue, saturation and brightness to change just those and keep the rest. Values between stops or steps snap to the nearest, and the notes say when they did. Returns the colour now chosen, as read_colour does.`,
  inputSchema: {
    additionalProperties: false,
    properties: {
      brightness: {
        ...STEP_INPUT,
        description:
          'Snapped to the nearest step. With nothing picked yet, give saturation too.',
      },
      clearPick: {
        description:
          'Clear the pick, leaving only the hue. Give it alone or with a hue.',
        type: 'boolean',
      },
      hex: {
        description:
          "A colour such as #3366CC, matched to Huebo's nearest. Give it alone.",
        pattern: String.raw`^#?(?:[\dA-Fa-f]{3}|[\dA-Fa-f]{6})$`,
        type: 'string',
      },
      hue: {
        description:
          'Degrees around the colour circle, snapped to the nearest stop and wrapped into 0–355.',
        type: 'number',
      },
      saturation: {
        ...STEP_INPUT,
        description:
          'Snapped to the nearest step. With nothing picked yet, give brightness too.',
      },
    },
    type: 'object',
  },
  name: 'choose_colour',
}

const LIST_SQUARES = {
  annotations: { readOnlyHint: true },
  description: `Lists the 64 squares of the grid for a hue without choosing anything, brightest row first: each pick's saturation, brightness and hex, and the text colour (white or black) that reads best on it with its WCAG contrast. Use it to compare picks before choosing one.`,
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

function linkTo(color: Color): string {
  return new URL(linkPath(color), globalThis.location.origin).href
}

/**
 * The page's colour tools for agents. `link` is the colour in the link, and
 * `choose` makes an agent's choice the way a person's is made.
 */
export function useColourTools(
  link: Color,
  choose: (color: Color) => void,
): void {
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
  description: `Chooses the format Huebo's card shows first and Copy writes: ${FORMATS.join(', ')}. It's remembered on this device. Returns the colour in that format, if one is picked.`,
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
