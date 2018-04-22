import React from 'react'
import PropTypes from 'prop-types'
import { hsb2Hex, hsb2Rgb } from '../utils/color_utils'
import ColorFormat from './ColorFormat'
import ColorProfileButton from './ColorProfileButton'

const ColorOutputs = ({
  copiedColorFormat,
  hue,
  saturation,
  brightness,
  hex: hexValue,
  onCopy,
}) => {
  let hsbValue = null
  let rgbValue = null

  const hasSelection = hue !== null && hue !== undefined

  if (hasSelection) {
    const { r, g, b } = hsb2Rgb(hue, saturation, brightness)
    rgbValue = `${r},${g},${b}`
    hsbValue = `${hue},${saturation},${brightness}`
  }

  return (
    <div>
      <ColorFormat
        label="HSB"
        copied={copiedColorFormat && copiedColorFormat === hsbValue}
        data-testid="color-format-hsb"
      >
        <ColorProfileButton
          value={hsbValue}
          placeholder="Select a color"
          onClick={onCopy}
        />
      </ColorFormat>

      <ColorFormat
        label="RGB"
        copied={copiedColorFormat && copiedColorFormat === rgbValue}
        data-testid="color-format-rgb"
      >
        <ColorProfileButton value={rgbValue} onClick={onCopy} />
      </ColorFormat>

      <ColorFormat
        label="Hex"
        copied={copiedColorFormat && copiedColorFormat === hexValue}
        data-testid="color-format-hex"
      >
        <ColorProfileButton value={hexValue} onClick={onCopy} />
      </ColorFormat>
    </div>
  )
}

ColorOutputs.propTypes = {
  copiedColorFormat: PropTypes.string,
  hue: PropTypes.number,
  saturation: PropTypes.number,
  brightness: PropTypes.number,
  onCopy: PropTypes.func.isRequired,
}

export default ColorOutputs
