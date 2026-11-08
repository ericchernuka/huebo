import PropTypes from 'prop-types'
import React from 'react'
import { Motion, spring } from 'react-motion'
import { Link, Route } from 'react-router-dom'

const springConfig = { damping: 24, stiffness: 300 }

const HsbSwatch = ({ hex, matchRoute, title, to, ...props }) => {
  return (
    <Route exact={true} path={to}>
      {({ match }) => (
        <Motion
          style={{
            scale: spring(match ? 1.1 : 1, springConfig),
            shadow: spring(match ? 16 : 1, springConfig),
          }}
        >
          {({ scale, shadow }) => (
            <Link
              {...props}
              aria-current={match ? 'true' : undefined}
              className="hue-swatch"
              style={{
                backgroundColor: hex,
                boxShadow: match
                  ? `inset 0 0 0 3px #FFF, 0 4px ${shadow}px 0 rgba(0,0,0,0.25)`
                  : undefined,
                transform: `translate3d(0, 0, 0) scale(${scale})`,
                WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
                zIndex: match ? 1 : undefined,
              }}
              to={match ? matchRoute : to}
            >
              <span className="sr-only">{title}</span>
            </Link>
          )}
        </Motion>
      )}
    </Route>
  )
}

HsbSwatch.propTypes = {
  hex: PropTypes.string.isRequired,
  matchRoute: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
}

export default HsbSwatch
