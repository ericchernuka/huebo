import * as stylex from '@stylexjs/stylex'
import { contrastRatio, type Rgb } from '../../shared/color'
import { colors, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'
import { FORMATS } from './formats'

const TEXT_COLOURS = [
  { name: 'White', rgb: [255, 255, 255], swatch: '#fff' },
  { name: 'Black', rgb: [0, 0, 0], swatch: '#000' },
] as const satisfies ReadonlyArray<{ name: string; rgb: Rgb; swatch: string }>

export function Details() {
  const { format, values } = useCard()

  if (values === null) {
    return null
  }

  return (
    <div>
      <p {...stylex.props(styles.others)}>
        {FORMATS.filter(other => other !== format).map(other => (
          <span key={other}>
            {other} {values.text[other]}
          </span>
        ))}
      </p>
      <ul aria-label="Text contrast" {...stylex.props(styles.chips)}>
        {TEXT_COLOURS.map(text => {
          const ratio = contrastRatio(text.rgb, values.rgb)

          return (
            <li key={text.name} {...stylex.props(styles.chip)}>
              <span
                aria-hidden="true"
                {...stylex.props(styles.sample(values.text.Hex, text.swatch))}
              >
                Aa
              </span>
              {text.name} text {(Math.floor(ratio * 10) / 10).toFixed(1)}:1,{' '}
              {grade(ratio)}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** The WCAG 2 level a contrast ratio reaches for normal or large text. */
function grade(ratio: number): string {
  if (ratio >= 7) {
    return 'AAA'
  }

  if (ratio >= 4.5) {
    return 'AA'
  }

  return ratio >= 3 ? 'AA large' : 'fails'
}

const styles = stylex.create({
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgb(0 0 0 / 0.05)',
    borderRadius: radii.pill,
    display: 'inline-flex',
    fontSize: 14,
    fontWeight: 600,
    gap: 8,
    padding: '4px 10px 4px 4px',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    listStyle: 'none',
    margin: '16px 0 0',
    padding: 0,
  },
  others: {
    color: colors.inkMuted,
    columnGap: 18,
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: 15,
    margin: '14px 0 0',
  },
  sample: (background: string, color: string) => ({
    backgroundColor: background,
    borderRadius: radii.pill,
    color,
    display: 'grid',
    fontSize: 13,
    height: 26,
    placeItems: 'center',
    width: 30,
  }),
})
