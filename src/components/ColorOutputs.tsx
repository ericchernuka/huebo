import { hsb2Rgb } from '../utils/color_utils';
import ColorFormat from './ColorFormat';
import ColorProfileButton from './ColorProfileButton';

interface Props {
  brightness: number | undefined;
  copiedColorFormat: string | null;
  hex: string | null;
  hue: number;
  onCopy: (value: string) => void;
  saturation: number | undefined;
}

export default function ColorOutputs({
  brightness,
  copiedColorFormat,
  hex: hexValue,
  hue,
  onCopy,
  saturation,
}: Props) {
  const hsbValue =
    brightness !== undefined && saturation !== undefined
      ? `${hue},${saturation},${brightness}`
      : null;
  let rgbValue = null;

  if (brightness !== undefined && saturation !== undefined) {
    const { b, g, r } = hsb2Rgb(hue, saturation, brightness);
    rgbValue = `${r},${g},${b}`;
  }

  return (
    <div>
      <ColorFormat
        copied={copiedColorFormat !== null && copiedColorFormat === hsbValue}
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
        copied={copiedColorFormat !== null && copiedColorFormat === rgbValue}
        data-testid="color-format-rgb"
        label="RGB"
      >
        <ColorProfileButton onClick={onCopy} value={rgbValue} />
      </ColorFormat>

      <ColorFormat
        copied={copiedColorFormat !== null && copiedColorFormat === hexValue}
        data-testid="color-format-hex"
        label="Hex"
      >
        <ColorProfileButton onClick={onCopy} value={hexValue} />
      </ColorFormat>
    </div>
  );
}
