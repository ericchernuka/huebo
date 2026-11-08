import React from 'react'
import PropTypes from 'prop-types'
import { buildHueIncrements } from '../utils'
import HsbSwatch from './HsbSwatch'

const SwatchGrid = ({ hue }) => {
  const matchRoute = `/${hue}`
  return (
    <div className="hue-swatches">
      {buildHueIncrements(hue).map(({ brightness, hex, saturation }) => (
        <HsbSwatch
          hex={hex}
          key={hex}
          matchRoute={matchRoute}
          title={`${hue},${saturation},${brightness}`}
          to={`/${hue}/${saturation}/${brightness}`}
        />
      ))}
    </div>
  )
}

SwatchGrid.propTypes = {
  hue: PropTypes.number.isRequired,
}

export default SwatchGrid
