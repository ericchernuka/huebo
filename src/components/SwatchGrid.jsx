import React from 'react'
import PropTypes from 'prop-types'
import { buildHueIncrements } from '../utils'
import HsbSwatch from './HsbSwatch'

export default class SwatchGrid extends React.Component {
  static propTypes = {
    hue: PropTypes.number.isRequired,
    selectedHex: PropTypes.number,
  }

  static defaultProps = {
    selectedHex: null,
  }

  handleSelection = swatch => () => this.props.onSelect(swatch)

  render() {
    const { hue, selectedHex } = this.props

    return (
      <div className="hue-swatches">
        {buildHueIncrements(hue).map(swatch => (
          <HsbSwatch
            key={swatch.hex}
            swatch={swatch}
            onClick={this.handleSelection(swatch)}
            selected={selectedHex === swatch.hex}
          />
        ))}
      </div>
    )
  }
}

SwatchGrid.propTypes = {
  hue: PropTypes.number.isRequired,
  selectedSwatch: PropTypes.shape({
    hue: PropTypes.number.isRequired,
    saturation: PropTypes.number.isRequired,
    brightness: PropTypes.number.isRequired,
    hex: PropTypes.string.isRequired,
  }),
  onSelect: PropTypes.func.isRequired,
}
