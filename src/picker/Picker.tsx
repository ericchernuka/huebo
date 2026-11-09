import * as stylex from '@stylexjs/stylex'
import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import { useEffect, useEffectEvent } from 'react'
import { useAnnounce } from '../shared/announcer'
import { hsbToHex } from '../shared/color'
import { colors, hue as hueVar, hueTheme } from '../shared/tokens.stylex'
import type { Color, Pick } from './color'
import {
  describeHue,
  HueDial,
  shownHue,
  useDialMotion,
  type Commit,
  type DialMotion,
} from './hue-dial'
import { CompactLayout } from './CompactLayout'
import { COMPACT_QUERY } from './layout'
import { RoomyLayout } from './RoomyLayout'
import { useMediaQuery } from './use-media-query'

const ROUTE = '/$hue/{-$saturation}/{-$brightness}'

export function Picker() {
  const color = useParams({ from: ROUTE })
  const announce = useAnnounce()
  const compact = useMediaQuery(COMPACT_QUERY)
  const [motion, dial] = useDialMotion()
  const hue = shownHue(motion, color.hue)
  const background = hsbToHex(hue, 12, 90)

  useCommits(dial, color)

  const pick = (next: Pick | null) => {
    dial.send({ pick: next, type: 'choose' }, hue)
    announce(
      next
        ? `Picked ${hsbToHex(hue, next.saturation, next.brightness)}`
        : 'Selection cleared',
    )
  }

  const layout = { color: { hue, pick: color.pick }, onPick: pick }

  return (
    <main {...stylex.props(hueTheme, styles.hue(String(hue)), styles.page)}>
      <title>{documentTitle(color)}</title>
      <meta content={background} name="theme-color" />
      {/* On the root, so the colour also fills the status bar and the strip
          behind a floating browser toolbar, outside <main>. */}
      <style>{`html { background-color: ${background}; }`}</style>
      <HueDial.Root dial={dial} hue={hue} motion={motion}>
        {compact ? <CompactLayout {...layout} /> : <RoomyLayout {...layout} />}
      </HueDial.Root>
    </main>
  )
}

function useCommits(dial: DialMotion, color: Color) {
  const navigate = useNavigate()
  const router = useRouter()
  const announce = useAnnounce()

  const commit = useEffectEvent(({ announce: speak, hue, pick }: Commit) => {
    const landed = () => dial.send({ hue, type: 'landed' })

    const alreadyInUrl = pick === undefined && hue === color.hue

    if (alreadyInUrl) {
      landed()

      return
    }

    if (speak) {
      announce(`Hue ${describeHue(hue)}`)
    }

    const params = { hue, pick: pick === undefined ? color.pick : pick }

    void navigate({ params, to: ROUTE }).then(landed)
  })

  useEffect(() => {
    const disconnect = dial.connect(next => commit(next))

    const unlisten = router.history.subscribe(({ action }) => {
      if (action.type !== 'PUSH' && action.type !== 'REPLACE') {
        dial.send({ type: 'traverse' })
      }
    })

    return () => {
      disconnect()
      unlisten()
    }
  }, [dial, router])
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
