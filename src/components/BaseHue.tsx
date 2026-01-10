import Label from './Label';

interface Props {
  hue: number;
}

export default function BaseHue({ hue }: Props) {
  return (
    <div className="base-hue-wrapper">
      <Label>Base Hue</Label>
      <div className="color-profile" data-testid="base-hue">{`${hue}°`}</div>
    </div>
  );
}
