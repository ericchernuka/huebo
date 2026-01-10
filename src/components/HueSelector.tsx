import { HUE_STEP, MAX_HUE, MIN_HUE } from '../constants';
import BaseHue from './BaseHue';

interface Props {
  onChange: (hue: number) => void;
  onChangeEnd: () => void;
  hue: number;
}

export default function HueSelector({ onChange, onChangeEnd, hue }: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange(parseInt(event.target.value, 10));

  return (
    <div>
      <BaseHue hue={hue} />
      <label htmlFor="hue-slider" className="sr-only">
        Hue
      </label>
      <input
        type="range"
        id="hue-slider"
        className="hue-slider"
        tabIndex={1}
        onChange={handleChange}
        onKeyDown={() => {}}
        onMouseDown={() => {}}
        onTouchStart={() => {}}
        onKeyUp={onChangeEnd}
        onMouseUp={onChangeEnd}
        onTouchEnd={onChangeEnd}
        value={hue}
        aria-valuenow={hue}
        min={MIN_HUE}
        max={MAX_HUE}
        step={HUE_STEP}
        aria-valuemin={MIN_HUE}
        aria-valuemax={MAX_HUE}
      />
    </div>
  );
}
