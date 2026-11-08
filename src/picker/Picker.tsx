import * as stylex from '@stylexjs/stylex'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { useAnnounce } from '../shared/announcer'
import { hsbToHex } from '../shared/color'
import {
  colors,
  hue as hueVar,
  hueTheme,
  motion,
} from '../shared/tokens.stylex'
import { ContextualHelp } from '../shared/contextual-help'
import { hexOf, type Color, type Hue, type Pick } from './color'
import { HueDial } from './hue-dial'
import { CompactLayout } from './CompactLayout'
import { COMPACT_QUERY } from './layout'
import { RoomyLayout } from './RoomyLayout'
import { useMediaQuery } from './use-media-query'

const ROUTE = '/$hue/{-$saturation}/{-$brightness}'

/**
 * The page. The URL holds the colour; a hue being dragged lives here as a
 * preview until the gesture ends, so history only records chosen colours.
 */
export function Picker() {
  const color = useParams({ from: ROUTE })
  const navigate = useNavigate()
  const announce = useAnnounce()
  const [preview, setPreview] = useState<Hue | null>(null)
  const compact = useMediaQuery(COMPACT_QUERY)
  const hue = preview ?? color.hue

  const go = (next: Color) => {
    // The preview holds the new hue on screen until the URL catches up.
    void navigate({ params: next, to: ROUTE }).then(() => setPreview(null))
  }

  const commitHue = (next: Hue) => {
    if (next === color.hue) {
      setPreview(null)
    } else {
      setPreview(next)
      go({ hue: next, pick: color.pick })
    }
  }

  const pick = (next: Pick | null) => {
    go({ hue, pick: next })
    announce(next ? `Picked ${hexOf(hue, next)}` : 'Selection cleared')
  }

  const layout = {
    color: { hue, pick: color.pick },
    header: <Header />,
    onPick: pick,
  }

  return (
    <main {...stylex.props(hueTheme, styles.hue(String(hue)), styles.page)}>
      <title>{documentTitle(color)}</title>
      <meta content={hsbToHex(hue, 12, 90)} name="theme-color" />
      <HueDial.Root hue={hue} onCommit={commitHue} onPreview={setPreview}>
        {compact ? <CompactLayout {...layout} /> : <RoomyLayout {...layout} />}
      </HueDial.Root>
    </main>
  )
}

function Header() {
  return (
    <>
      <h1 {...stylex.props(styles.title)}>Huebo</h1>
      <Help />
    </>
  )
}

function Help() {
  return (
    <ContextualHelp.Root>
      <ContextualHelp.Heading>Picking a colour</ContextualHelp.Heading>
      <ContextualHelp.Content>
        <p {...stylex.props(styles.helpText)}>
          Turn the dial to choose a hue, then pick one of its 64 steps. Copy it
          as HSB, RGB or Hex.
        </p>
        <p {...stylex.props(styles.helpText)}>
          On the dial, the arrow keys step 5° and Shift steps 45°. In the grid,
          the arrow keys move, Enter picks and Escape clears.
        </p>
      </ContextualHelp.Content>
    </ContextualHelp.Root>
  )
}

function documentTitle({ hue, pick }: Color): string {
  return pick
    ? `HSB(${hue},${pick.saturation},${pick.brightness}) | Huebo`
    : `Hue: ${hue} | Huebo`
}

const styles = stylex.create({
  helpText: { margin: 0 },
  hue: (degrees: string) => ({ [hueVar.degrees]: degrees }),
  page: {
    backgroundColor: colors.background,
    color: colors.ink,
    fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif',
    fontSize: 17,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.4,
    minHeight: '100svh',
    transitionDuration: motion.fade,
    transitionProperty: 'background-color',
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    margin: 0,
  },
})
