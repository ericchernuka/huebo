import { HUE_STEP, MAX_HUE, MIN_HUE } from '../constants';
import { BaseHue } from './BaseHue';

interface Props {
  hue: number;
  onChange: (hue: number) => void;
}

export function HueSelector({ hue, onChange }: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange(Number.parseInt(event.target.value, 10));

  return (
    <div>
      <BaseHue hue={hue} />
      <label className="sr-only" htmlFor="hue-slider">
        Hue
      </label>
      <input
        aria-valuemax={MAX_HUE}
        aria-valuemin={MIN_HUE}
        aria-valuenow={hue}
        className="hue-slider"
        id="hue-slider"
        max={MAX_HUE}
        min={MIN_HUE}
        onChange={handleChange}
        step={HUE_STEP}
        tabIndex={1}
        type="range"
        value={hue}
      />
    </div>
  );
}
