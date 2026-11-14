import * as stylex from '@stylexjs/stylex'
import { useNavigate, useParams, useRouter } from '@tanstack/react-router'
import { useEffect, useEffectEvent } from 'react'
import { useAnnounce } from '../shared/announcer'
import { useColourTools } from './agent/tools'
import {
  colors,
  hue as hueVar,
  hueTheme,
  instantMotion,
} from '../shared/tokens.stylex'
import { pageBackground, type Color, type Pick } from './color'
import {
  followsPointer,
  HueDial,
  shownHue,
  useDialMotion,
  type DialMotion,
} from './hue-dial'
import { CompactLayout } from './CompactLayout'
import { COMPACT_QUERY } from './layout'
import { pageHead } from './page-head'
import { RoomyLayout } from './RoomyLayout'
import { useMediaQuery } from './use-media-query'

const ROUTE = '/$hue/{-$saturation}/{-$brightness}'

export function Picker() {
  const color = useParams({ from: ROUTE })
  const compact = useMediaQuery(COMPACT_QUERY)
  const [motion, dial] = useDialMotion()
  const hue = shownHue(motion, color.hue)
  const background = pageBackground(hue)
  const instant = followsPointer(motion)

  useLinkedDial(dial, color)

  useColourTools(color, chosen => dial.send({ ...chosen, type: 'jump' }, hue))

  const pick = (next: Pick | null) =>
    dial.send({ pick: next, type: 'choose' }, hue)

  const layout = { color: { hue, pick: color.pick }, onPick: pick }

  return (
    <main
      {...stylex.props(
        hueTheme,
        instant && instantMotion,
        styles.hue(String(hue)),
        styles.page,
      )}
    >
      <title>{pageHead(color).title}</title>
      <meta content={background} name="theme-color" />
      {/* On the root, so the colour also fills the status bar and the strip
          behind a floating browser toolbar, outside <main>. */}
      <style>{`html { background-color: ${background};${instant ? ' transition: none;' : ''} }`}</style>
      <HueDial.Root dial={dial} hue={hue} motion={motion}>
        {compact ? <CompactLayout {...layout} /> : <RoomyLayout {...layout} />}
      </HueDial.Root>
    </main>
  )
}

function useLinkedDial(dial: DialMotion, color: Color) {
  const navigate = useNavigate()
  const router = useRouter()
  const announce = useAnnounce()
  const link = useEffectEvent(() => color)
  const speak = useEffectEvent((text: string) => announce(text))

  const pushLink = useEffectEvent((params: Color) =>
    navigate({ params, to: ROUTE }),
  )

  useEffect(
    () =>
      dial.connect({
        announce: text => speak(text),
        navigate: params => pushLink(params),
        link: () => link(),
        onTraverse: traversed =>
          router.history.subscribe(({ action }) => {
            if (action.type !== 'PUSH' && action.type !== 'REPLACE') {
              traversed()
            }
          }),
      }),
    [dial, router],
  )
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
