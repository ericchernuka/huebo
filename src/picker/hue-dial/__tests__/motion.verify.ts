import { expect, test } from 'vitest'
import { shownHue, type MotionEvent } from '../motion'
import { actions, back, coastOut, load, pause } from './actions'
import { take } from './take'
import { START, type Action, type Sent, type World } from './world'

/** How many steps deep the search goes. Every order of steps up to it is tried. */
const DEPTH = 7

const FINISHING = new Set<MotionEvent['type']>([
  'cancel',
  'choose',
  'frame',
  'jump',
  'letGo',
  'pause',
  'release',
  'step',
])

const AUTONOMOUS = new Set(['coasting', 'landing', 'scrolling'])

type Move = {
  readonly after: World
  readonly before: World
  readonly sent: ReadonlyArray<Sent>
  readonly step: Action
}

type Check = (move: Move) => string | null

const PROPERTIES = {
  'only a finished choice writes history': ({ sent }) => {
    const early = sent.find(
      ({ commit, event }) => commit && !FINISHING.has(event.type),
    )

    return early
      ? `"${early.event.type}" committed hue ${early.commit?.hue}`
      : null
  },

  'a coast or scroll never lands after something overtook it': ({
    before,
    sent,
  }) => {
    const index = sent.findIndex(
      ({ commit, event }) =>
        commit && (event.type === 'frame' || event.type === 'pause'),
    )

    const overtaken =
      !before.ownedRun || sent.slice(0, index).some(({ commit }) => commit)

    return index >= 0 && overtaken
      ? `a "${sent[index]?.event.type}" committed hue ${sent[index]?.commit?.hue}`
      : null
  },

  'the screen keeps showing a choice until the next input': ({ after }) => {
    const shown = shownHue(after.motion, after.url.hue)

    return after.holding !== null && shown !== after.holding
      ? `${after.holding}° was chosen, but ${shown}° is on screen`
      : null
  },

  'Back stops anything moving on its own': ({ after, step }) =>
    step === back && AUTONOMOUS.has(after.motion.kind)
      ? `still ${after.motion.kind} after Back`
      : null,
} satisfies Record<string, Check>

const SETTLES = 'nothing stays in motion once the page settles'

const SETTLING = new Set([coastOut, load, pause])

const SETTLE_LIMIT = 100

/** Lets the page run with nobody touching it: coasts end, pauses fire, navigations finish. */
function settle(world: World): World {
  let next = world

  for (let rounds = 0; rounds < SETTLE_LIMIT; rounds++) {
    const pageStep = actions(next).find(step => SETTLING.has(step))

    if (!pageStep) {
      return next
    }

    next = take(next, pageStep).world
  }

  return next
}

function stillMoving(world: World): string | null {
  const { fingers, keyDown, motion } = settle(world)

  switch (motion.kind) {
    case 'idle':
      return null
    case 'held':
      return keyDown ? null : 'held with no key or ring held down'
    case 'turning':
      return fingers.includes(motion.gesture.pointerId)
        ? null
        : 'turning with no finger down'
    default:
      return `still ${motion.kind} with nothing left to happen`
  }
}

type Path = ReadonlyArray<string>

type Findings = Map<string, string>

function record(
  findings: Findings,
  path: Path,
  [property, detail]: [string, string | null],
) {
  if (detail !== null && !findings.has(property)) {
    const story = path.map((label, index) => `  ${index + 1}. ${label}`)

    findings.set(
      property,
      [`Broken: ${property}`, ...story, `  → ${detail}`].join('\n'),
    )
  }
}

type Search = { readonly findings: Findings; readonly seen: Set<string> }

/** The worlds one step from `world` that the search hasn't met yet. */
function expand(search: Search, world: World, path: Path) {
  return actions(world).flatMap(step => {
    const { sent, world: after } = take(world, step)
    const trail = [...path, step.label]
    const move = { after, before: world, sent, step }

    for (const [property, check] of Object.entries(PROPERTIES)) {
      record(search.findings, trail, [property, check(move)])
    }

    const id = JSON.stringify(after)

    if (search.seen.has(id)) {
      return []
    }

    search.seen.add(id)
    record(search.findings, trail, [SETTLES, stillMoving(after)])

    return [[after, trail] as const]
  })
}

/** Breadth first, so each finding is the shortest path that breaks its property. */
function explore(): Search {
  const search = { findings: new Map(), seen: new Set([JSON.stringify(START)]) }
  let frontier: ReadonlyArray<readonly [World, Path]> = [[START, []]]

  for (let depth = 0; depth < DEPTH; depth++) {
    frontier = frontier.flatMap(([world, path]) => expand(search, world, path))
  }

  return search
}

test(`given every order of up to ${DEPTH} steps, then the dial keeps its promises`, () => {
  const { findings, seen } = explore()

  expect([...findings.values()], `${seen.size} states explored`).toEqual([])
  expect(seen.size).toBeGreaterThan(1000)
})
