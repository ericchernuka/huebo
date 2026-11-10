import * as stylex from '@stylexjs/stylex'
import { colors, radii } from '../../shared/tokens.stylex'
import { useCard } from './ColorCardRoot'
import { FORMATS, textContrast } from '../formats'

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
        {textContrast(values.rgb).map(text => (
          <li key={text.name} {...stylex.props(styles.chip)}>
            <span
              aria-hidden="true"
              {...stylex.props(styles.sample(values.text.Hex, text.swatch))}
            >
              Aa
            </span>
            {text.name} text {text.ratio.toFixed(1)}:1, {text.grade}
          </li>
        ))}
      </ul>
    </div>
  )
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
