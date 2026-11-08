import PropTypes from 'prop-types'
import React from 'react'
import { hsb2Rgb } from '../utils/color_utils'
import ColorFormat from './ColorFormat'
import ColorProfileButton from './ColorProfileButton'

const ColorOutputs = ({
  brightness = null,
  copiedColorFormat = null,
  hex: hexValue,
  hue,
  onCopy,
  saturation = null,
}) => {
  const hsbValue = brightness ? `${hue},${saturation},${brightness}` : null
  let rgbValue = null

  if (brightness) {
    const { b, g, r } = hsb2Rgb(hue, saturation, brightness)
    rgbValue = `${r},${g},${b}`
  }

  return (
    <div>
      <ColorFormat
        copied={copiedColorFormat && copiedColorFormat === hsbValue}
        data-testid="color-format-hsb"
        label="HSB"
      >
        <ColorProfileButton
          onClick={onCopy}
          placeholder="Select a color"
          value={hsbValue}
        />
      </ColorFormat>

      <ColorFormat
        copied={copiedColorFormat && copiedColorFormat === rgbValue}
        data-testid="color-format-rgb"
        label="RGB"
      >
        <ColorProfileButton onClick={onCopy} value={rgbValue} />
      </ColorFormat>

      <ColorFormat
        copied={copiedColorFormat && copiedColorFormat === hexValue}
        data-testid="color-format-hex"
        label="Hex"
      >
        <ColorProfileButton onClick={onCopy} value={hexValue} />
      </ColorFormat>
    </div>
  )
}

ColorOutputs.propTypes = {
  brightness: PropTypes.number,
  copiedColorFormat: PropTypes.string,
  hue: PropTypes.number.isRequired,
  onCopy: PropTypes.func.isRequired,
  saturation: PropTypes.number,
}

export default ColorOutputs
