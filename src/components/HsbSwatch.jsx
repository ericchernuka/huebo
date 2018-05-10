import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'
import { Route, Link } from 'react-router-dom'

const springConfig = { stiffness: 300, damping: 24 }

const HsbSwatch = ({ hex, matchRoute, to, title, ...props }) => {
  return (
    <Route
      path={to}
      exact={true}
      children={({ match }) => (
        <Motion
          style={{
            scale: spring(match ? 1.1 : 1, springConfig),
            shadow: spring(match ? 16 : 1, springConfig),
          }}
        >
          {({ scale, shadow, y }) => (
            <Link
              {...props}
              className="hue-swatch"
              aria-pressed={String(Boolean(match))}
              to={match ? matchRoute : to}
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
              <span className="sr-only">{title}</span>
            </Link>
          )}
        </Motion>
      )}
    />
  )
}

HsbSwatch.propTypes = {
  hex: PropTypes.string.isRequired,
  matchRoute: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
}

export default HsbSwatch
