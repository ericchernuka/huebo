import React from 'react'
import PropTypes from 'prop-types'
import { hsb2Hex, hsb2Rgb } from '../utils/color_utils'
import ColorFormat from './ColorFormat'
import ColorProfileButton from './ColorProfileButton'

class ColorOutputs extends React.Component {
  render() {
    const { copiedColorFormat, hue, saturation, brightness, onCopy } = this.props

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
      <div>
        <ColorFormat label="HSB" copied={copiedColorFormat && copiedColorFormat === hsbValue}>
          <ColorProfileButton value={hsbValue} placeholder="Select a color" onClick={onCopy} />
        </ColorFormat>

        <ColorFormat label="RGB" copied={copiedColorFormat && copiedColorFormat === rgbValue}>
          <ColorProfileButton value={rgbValue} onClick={onCopy} />
        </ColorFormat>

        <ColorFormat label="Hex" copied={copiedColorFormat && copiedColorFormat === hexValue}>
          <ColorProfileButton value={hexValue} onClick={onCopy} />
        </ColorFormat>
      </div>
    )
  }
}

ColorOutputs.propTypes = {
  copiedColorFormat: PropTypes.string,
  hue: PropTypes.number,
  saturation: PropTypes.number,
  brightness: PropTypes.number,
  onCopy: PropTypes.func.isRequired,
}

export default ColorOutputs
