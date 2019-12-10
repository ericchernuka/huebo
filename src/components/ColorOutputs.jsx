import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { hsb2Rgb } from '../utils/color_utils';
import ColorFormat from './ColorFormat';
import ColorProfileButton from './ColorProfileButton';
import copy from 'copy-to-clipboard';

const ColorOutputs = ({ hue, saturation, brightness, hex: hexValue }) => {
  const [copiedColorFormat, setCopiedColorFormat] = useState(null);

  useEffect(() => {
    setCopiedColorFormat(null);
  }, [hue, saturation, brightness]);

  useEffect(() => {
    if (copiedColorFormat) {
      copy(copiedColorFormat);
    }
  }, [copiedColorFormat]);

  const hsbValue = brightness ? `${hue},${saturation},${brightness}` : null;
  let rgbValue = null;

  if (brightness) {
    const { r, g, b } = hsb2Rgb(hue, saturation, brightness);
    rgbValue = `${r},${g},${b}`;
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
          onClick={setCopiedColorFormat}
        />
      </ColorFormat>

      <ColorFormat
        label="RGB"
        copied={copiedColorFormat && copiedColorFormat === rgbValue}
        data-testid="color-format-rgb"
      >
        <ColorProfileButton value={rgbValue} onClick={setCopiedColorFormat} />
      </ColorFormat>

      <ColorFormat
        label="Hex"
        copied={copiedColorFormat && copiedColorFormat === hexValue}
        data-testid="color-format-hex"
      >
        <ColorProfileButton value={hexValue} onClick={setCopiedColorFormat} />
      </ColorFormat>
    </div>
  );
};

ColorOutputs.propTypes = {
  copiedColorFormat: PropTypes.string,
  hue: PropTypes.number.isRequired,
  saturation: PropTypes.number,
  brightness: PropTypes.number,
};

ColorOutputs.defaultProps = {
  copiedColorFormat: null,
  saturation: null,
  brightness: null,
};

export default ColorOutputs;
