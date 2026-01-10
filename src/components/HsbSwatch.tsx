import { Motion, spring } from 'react-motion';

interface Props {
  hex: string;
  selected: boolean;
  onClick: () => void;
  title: string;
}

const springConfig = { stiffness: 300, damping: 24 };

export default function HsbSwatch({ hex, selected, onClick, title }: Props) {
  return (
    <Motion
      style={{
        scale: spring(selected ? 1.1 : 1, springConfig),
        shadow: spring(selected ? 16 : 1, springConfig),
      }}
    >
      {({ scale, shadow }) => (
        <button
          role="button"
          className="hue-swatch"
          aria-pressed={selected}
          onClick={onClick}
          style={{
            boxShadow: selected
              ? `inset 0 0 0 3px #FFF, 0 4px ${shadow}px 0 rgba(0,0,0,0.25)`
              : undefined,
            transform: `translate3d(0, 0, 0) scale(${scale})`,
            WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
            backgroundColor: hex,
            zIndex: selected ? 1 : undefined,
          }}
        >
          <span className="sr-only">{title}</span>
        </button>
      )}
    </Motion>
  );
}
