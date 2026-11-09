import * as stylex from '@stylexjs/stylex'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { useAnnounce } from '../shared/announcer'
import { hsbToHex } from '../shared/color'
import { colors, hue as hueVar, hueTheme } from '../shared/tokens.stylex'
import type { Color, Hue, Pick } from './color'
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
  const [seenHue, setSeenHue] = useState(color.hue)
  const compact = useMediaQuery(COMPACT_QUERY)
  const stopMotionRef = useRef<(() => void) | null>(null)

  // Once the URL's hue moves, by a commit or by Back, the preview is spent.
  if (seenHue !== color.hue) {
    setSeenHue(color.hue)
    setPreview(null)
  }

  const hue = preview ?? color.hue
  const background = hsbToHex(hue, 12, 90)

  const go = (next: Color) => {
    // A choice made anywhere catches a coasting wheel, so it can't land later and undo it.
    stopMotionRef.current?.()
    void navigate({ params: next, to: ROUTE })
  }

  const commitHue = (next: Hue) => {
    if (next === color.hue) {
      setPreview(null)
    } else {
      // The preview holds the new hue on screen until the URL catches up.
      setPreview(next)
      go({ hue: next, pick: color.pick })
    }
  }

  const pick = (next: Pick | null) => {
    go({ hue, pick: next })
    announce(
      next
        ? `Picked ${hsbToHex(hue, next.saturation, next.brightness)}`
        : 'Selection cleared',
    )
  }

  const layout = {
    color: { hue, pick: color.pick },
    onPick: pick,
  }

  return (
    <main {...stylex.props(hueTheme, styles.hue(String(hue)), styles.page)}>
      <title>{documentTitle(color)}</title>
      <meta content={background} name="theme-color" />
      {/* On the root, so the colour also fills the status bar and the strip
          behind a floating browser toolbar, outside <main>. */}
      <style>{`html { background-color: ${background}; }`}</style>
      <HueDial.Root
        hue={hue}
        onCommit={commitHue}
        onPreview={setPreview}
        stopMotionRef={stopMotionRef}
      >
        {compact ? <CompactLayout {...layout} /> : <RoomyLayout {...layout} />}
      </HueDial.Root>
    </main>
  )
}

function documentTitle({ hue, pick }: Color): string {
  return pick
    ? `HSB(${hue},${pick.saturation},${pick.brightness}) | Huebo`
    : `Hue: ${hue} | Huebo`
}

const styles = stylex.create({
  hue: (degrees: string) => ({ [hueVar.degrees]: degrees }),
  page: {
    color: colors.ink,
    fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif',
    fontSize: 17,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.4,
    minHeight: '100svh',
  },
})
