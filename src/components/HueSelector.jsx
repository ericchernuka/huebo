import PropTypes from 'prop-types'
import React from 'react'
import { HUE_STEP, MAX_HUE, MIN_HUE } from '../constants'
import BaseHue from './BaseHue'

class HueSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    hue: PropTypes.number.isRequired,
  }

  handleChange = ({ target: { value } }) => {
    this.props.onChange(parseInt(value, 10))
  }

  handleKeyUp = e => {
    // Only trigger if any of the arrow keys
    if (e.keyCode < 37 && e.keyCode < 40) return

    e.persist()
    this.handleAfterChange(e)
  }

  handleAfterChange = ({ target: { value } }) =>
    this.props.onAfterChange(parseInt(value, 10))

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
          tabIndex={1}
          onChange={this.handleChange}
          onKeyUp={this.handleKeyUp}
          onMouseUp={this.handleAfterChange}
          onTouchEnd={this.handleAfterChange}
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
