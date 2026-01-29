import { memo } from 'react';
import { Motion, spring } from 'react-motion';

interface Props {
  hex: string;
  onClick: () => void;
  selected: boolean;
  title: string;
}

const springConfig = { damping: 24, stiffness: 300 };

function HsbSwatchComponent({ hex, onClick, selected, title }: Props) {
  return (
    <Motion
      style={{
        scale: spring(selected ? 1.1 : 1, springConfig),
        shadow: spring(selected ? 16 : 1, springConfig),
      }}
    >
      {({ scale, shadow }) => (
        <button
          aria-pressed={selected}
          className="hue-swatch"
          onClick={onClick}
          role="button"
          style={{
            backgroundColor: hex,
            boxShadow: selected
              ? `inset 0 0 0 3px #FFF, 0 4px ${shadow}px 0 rgba(0,0,0,0.25)`
              : undefined,
            transform: `translate3d(0, 0, 0) scale(${scale})`,
            WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
            zIndex: selected ? 1 : undefined,
          }}
        >
          <span className="sr-only">{title}</span>
        </button>
      )}
    </Motion>
  );
}

export const HsbSwatch = memo(HsbSwatchComponent);
