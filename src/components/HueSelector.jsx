import React from 'react'
import PropTypes from 'prop-types'
import BaseHue from './BaseHue'
import { HUE_STEP, MIN_HUE, MAX_HUE } from '../constants'

class HueSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    hue: PropTypes.number,
  }

  handleChange = ({ target: { value } }) => this.props.onChange(parseInt(value, 10))

  render() {
    const { hue } = this.props

    return (
      <div>
        <BaseHue hue={hue} />
        <input
          type="range"
          className="hue-slider"
          min={MIN_HUE}
          max={MAX_HUE}
          step={HUE_STEP}
          onChange={this.handleChange}
          value={hue}
        />
      </div>
    )
  }
}

export default HueSelector
