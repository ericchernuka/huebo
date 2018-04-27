import React from 'react'
import PropTypes from 'prop-types'
import { buildHueIncrements } from '../utils'
import HsbSwatch from './HsbSwatch'

const SwatchGrid = ({ hue }) => {
  const matchRoute = `/${hue}`
  return (
    <div className="hue-swatches">
      {buildHueIncrements(hue).map(({ saturation, brightness, hex }) => (
        <HsbSwatch
          key={hex}
          hex={hex}
          matchRoute={matchRoute}
          to={`/${hue}/${saturation}/${brightness}`}
          title={`${hue},${saturation},${brightness}`}
        />
      ))}
    </div>
  )
}

SwatchGrid.propTypes = {
  hue: PropTypes.number.isRequired,
}

export default SwatchGrid
