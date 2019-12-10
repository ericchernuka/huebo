import React, { ReactNode } from 'react';
import { Motion, spring } from 'react-motion';
import { Link, useRouteMatch } from 'react-router-dom';

type SwatchLink = {
  children: ReactNode;
  to: string;
  returnTo: string;
  hex: string;
};

const springConfig = { stiffness: 300, damping: 24 };

const SwatchLink = ({ children, to, hex, returnTo }: SwatchLink) => {
  const match = useRouteMatch(to as string);

  return (
    <Motion
      style={{
        scale: spring(match ? 1.1 : 1, springConfig),
        shadow: spring(match ? 16 : 1, springConfig),
      }}
    >
      {({ scale, shadow, y }) => (
        <Link
          to={match ? returnTo : to}
          role="button"
          aria-pressed={Boolean(match)}
          className="w-1/8 h-1/8"
          style={{
            boxShadow: match
              ? `inset 0 0 0 3px #FFF, 0 4px ${shadow}px 0 rgba(0,0,0,0.25)`
              : undefined,
            transform: `translate3d(0, 0, 0) scale(${scale})`,
            WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
            backgroundColor: hex,
            zIndex: match ? 1 : undefined,
          }}
        >
          {children}
        </Link>
      )}
    </Motion>
  );
};

export default SwatchLink;
