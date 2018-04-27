import React from 'react'
import PropTypes from 'prop-types'
import BaseHue from './BaseHue'
import { HUE_STEP, MIN_HUE, MAX_HUE } from '../constants'

class HueSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    hue: PropTypes.number.isRequired,
  }

  handleChange = ({ target: { value } }) => {
    this.props.onChange(parseInt(value, 10))
  }

  handleFocus = ({ target: { value } }) => {
    this.props.onFocus(parseInt(value, 10))
  }

  render() {
    const { hue } = this.props

    return (
      <div>
        <BaseHue hue={hue} />
        <label htmlFor="hue-slider" className="sr-only">
          Hue
        </label>
        <input
          type="range"
          id="hue-slider"
          className="hue-slider"
          onChange={this.handleChange}
          onFocus={this.handleFocus}
          value={hue}
          aria-valuenow={hue}
          min={MIN_HUE}
          max={MAX_HUE}
          step={HUE_STEP}
          aria-valuemin={MIN_HUE}
          aria-valuemax={MAX_HUE}
        />
      </div>
    )
  }
}

export default HueSelector
