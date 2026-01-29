import { buildHueIncrements } from '../utils/hue-increments';
import { HsbSwatch } from './hsb-swatch';

interface Props {
  hue: number;
  onSwatchClick: (saturation: number, brightness: number) => void;
  selectedHex: string | null;
}

export function SwatchGrid({ hue, onSwatchClick, selectedHex }: Props) {
  return (
    <div className="hue-swatches">
      {buildHueIncrements(hue).map(({ brightness, hex, saturation }) => (
        <HsbSwatch
          hex={hex}
          key={hex}
          onClick={() => onSwatchClick(saturation, brightness)}
          selected={hex === selectedHex}
          title={`${hue},${saturation},${brightness}`}
        />
      ))}
    </div>
  );
}
