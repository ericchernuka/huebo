import { hsb2Rgb } from '../utils/color_utils';
import ColorFormat from './ColorFormat';
import ColorProfileButton from './ColorProfileButton';

interface Props {
  copiedColorFormat: string | null;
  hue: number;
  saturation: number | null;
  brightness: number | null;
  hex: string | null;
  onCopy: (value: string) => void;
}

export default function ColorOutputs({
  copiedColorFormat,
  hue,
  saturation,
  brightness,
  hex: hexValue,
  onCopy,
}: Props) {
  const hsbValue =
    brightness !== null && saturation !== null
      ? `${hue},${saturation},${brightness}`
      : null;
  let rgbValue = null;

  if (brightness !== null && saturation !== null) {
    const { r, g, b } = hsb2Rgb(hue, saturation, brightness);
    rgbValue = `${r},${g},${b}`;
  }

  return (
    <div>
      <ColorFormat
        label="HSB"
        copied={copiedColorFormat !== null && copiedColorFormat === hsbValue}
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
        copied={copiedColorFormat !== null && copiedColorFormat === rgbValue}
        data-testid="color-format-rgb"
      >
        <ColorProfileButton value={rgbValue} onClick={onCopy} />
      </ColorFormat>

      <ColorFormat
        label="Hex"
        copied={copiedColorFormat !== null && copiedColorFormat === hexValue}
        data-testid="color-format-hex"
      >
        <ColorProfileButton value={hexValue} onClick={onCopy} />
      </ColorFormat>
    </div>
  );
}
