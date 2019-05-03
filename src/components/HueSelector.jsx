import PropTypes from 'prop-types'
import React from 'react'
import { HUE_STEP, MAX_HUE, MIN_HUE } from '../constants'
import BaseHue from './BaseHue'

class HueSelector extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    hue: PropTypes.number.isRequired,
  }

  handleChange = event => this.props.onChange(parseInt(event.target.value, 10))

  handleDragStart = () => this.props.onDrag({ isDragging: true })
  handleDragEnd = () => this.props.onDrag({ isDragging: false })

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
          onChange={e => this.handleChange(e)}
          onKeyDown={this.handleDragStart}
          onMouseDown={this.handleDragStart}
          onTouchStart={this.handleDragStart}
          onKeyUp={this.handleDragEnd}
          onMouseUp={this.handleDragEnd}
          onTouchEnd={this.handleDragEnd}
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
