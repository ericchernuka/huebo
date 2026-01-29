import { motion } from 'motion/react';
import { memo } from 'react';

interface Props {
  hex: string;
  onClick: () => void;
  selected: boolean;
  title: string;
}

const transition = {
  damping: 24,
  stiffness: 300,
  type: 'spring' as const,
};

function HsbSwatchComponent({ hex, onClick, selected, title }: Props) {
  return (
    <motion.button
      animate={{
        boxShadow: selected
          ? 'inset 0 0 0 3px #FFF, 0 4px 16px 0 rgba(0,0,0,0.25)'
          : 'inset 0 0 0 0px transparent, 0 0px 0px 0 transparent',
        scale: selected ? 1.1 : 1,
      }}
      aria-pressed={selected}
      className="hue-swatch"
      onClick={onClick}
      role="button"
      style={{
        backgroundColor: hex,
        zIndex: selected ? 1 : undefined,
      }}
      transition={transition}
    >
      <span className="sr-only">{title}</span>
    </motion.button>
  );
}

export const HsbSwatch = memo(HsbSwatchComponent);
