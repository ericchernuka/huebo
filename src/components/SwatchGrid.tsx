import { buildHueIncrements } from '../utils';
import HsbSwatch from './HsbSwatch';

interface Props {
  hue: number;
  selectedHex: string | null;
  onSwatchClick: (saturation: number, brightness: number) => void;
}

export default function SwatchGrid({ hue, selectedHex, onSwatchClick }: Props) {
  return (
    <div className="hue-swatches">
      {buildHueIncrements(hue).map(({ saturation, brightness, hex }) => (
        <HsbSwatch
          key={hex}
          hex={hex}
          selected={hex === selectedHex}
          onClick={() => onSwatchClick(saturation, brightness)}
          title={`${hue},${saturation},${brightness}`}
        />
      ))}
    </div>
  );
}
