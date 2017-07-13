import React from 'react'
import PropTypes from 'prop-types'
import { Block } from 'jsxstyle'
import { hsb2Hex, hsb2Rgb } from '../utils/color'
import ColorFormat from './ColorFormat'

class ColorOutputs extends React.Component {
  render() {
    const {
      copiedColorFormat,
      hue,
      saturation,
      brightness,
      onCopy,
    } = this.props

    let hsbValue = null
    let rgbValue = null
    let hexValue = null

    const hasSelection = hue !== null && hue !== undefined

    if (hasSelection) {
      const { r, g, b } = hsb2Rgb(hue, saturation, brightness)
      rgbValue = `${r},${g},${b}`
      hsbValue = `${hue},${saturation},${brightness}`
      hexValue = hsb2Hex(hue, saturation, brightness).toUpperCase()
    }

    return (
      <Block>
        <ColorFormat
          label='HSB'
          value={hsbValue}
          placeholder="Select a color"
          onClick={onCopy(hsbValue)}
          copied={copiedColorFormat && copiedColorFormat === hsbValue}
        />
        <ColorFormat
          label='RGB'
          value={rgbValue}
          onClick={onCopy(rgbValue)}
          copied={copiedColorFormat && copiedColorFormat === rgbValue}
        />
        <ColorFormat
          label='Hex'
          value={hexValue}
          onClick={onCopy(hexValue)}
          copied={copiedColorFormat && copiedColorFormat === hexValue}
        />
      </Block>
    )
  }
}

export default ColorOutputs