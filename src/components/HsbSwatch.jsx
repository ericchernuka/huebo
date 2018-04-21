import React from 'react'
import PropTypes from 'prop-types'
import { Motion, spring } from 'react-motion'

const springConfig = { stiffness: 300, damping: 24 }

class HsbSwatch extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    swatch: PropTypes.shape({
      hue: PropTypes.number.isRequired,
      saturation: PropTypes.number.isRequired,
      brightness: PropTypes.number.isRequired,
      hex: PropTypes.string.isRequired,
    }),
  }

  static defaultProps = {
    selected: false,
  }

  handleClick = () => this.props.onClick(this.props.swatch)

  render() {
    const {
      selected,
      swatch: { hex },
    } = this.props

    return (
      <Motion
        style={{
          scale: spring(selected ? 1.1 : 1, springConfig),
          shadow: spring(selected ? 16 : 1, springConfig),
        }}
      >
        {({ scale, shadow, y }) => (
          <button
            type="button"
            className="hue-swatch"
            onClick={this.handleClick}
            style={{
              boxShadow: selected
                ? `inset 0 0 0 3px #FFF, 0 4px ${shadow}px 0 rgba(0,0,0,0.25)`
                : undefined,
              transform: `translate3d(0, 0, 0) scale(${scale})`,
              WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
              backgroundColor: hex,
              zIndex: selected ? 1 : undefined,
            }}
          />
        )}
      </Motion>
    )
  }
}

export default HsbSwatch
