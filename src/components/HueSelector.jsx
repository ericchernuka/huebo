import PropTypes from 'prop-types'
import React from 'react'
import { HUE_STEP, MAX_HUE, MIN_HUE } from '../constants'
import BaseHue from './BaseHue'

class HueSelector extends React.Component {
  static propTypes = {
    hue: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  handleChange = event => this.props.onChange(Number.parseInt(event.target.value, 10))

  handleDragStart = () => this.props.onDrag({ isDragging: true })
  handleDragEnd = () => this.props.onDrag({ isDragging: false })

  render() {
    const { hue } = this.props

    return (
      <div>
        <BaseHue hue={hue} />
        <label className="sr-only" htmlFor="hue-slider">
          Hue
        </label>
        <input
          aria-valuemax={MAX_HUE}
          aria-valuemin={MIN_HUE}
          aria-valuenow={hue}
          className="hue-slider"
          id="hue-slider"
          max={MAX_HUE}
          min={MIN_HUE}
          onChange={this.handleChange}
          onKeyDown={this.handleDragStart}
          onKeyUp={this.handleDragEnd}
          onMouseDown={this.handleDragStart}
          onMouseUp={this.handleDragEnd}
          onTouchEnd={this.handleDragEnd}
          onTouchStart={this.handleDragStart}
          step={HUE_STEP}
          type="range"
          value={hue}
        />
      </div>
    )
  }
}

export default HueSelector
