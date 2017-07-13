import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'jsxstyle'
import HsbSwatch from './HsbSwatch'

const increments = [ 12, 25, 38, 50, 62, 75, 88, 100 ]

class HueRow extends React.Component {
  handleSelect = (hue, saturation, brightness) => () => {
    this.props.onSelect && this.props.onSelect({
      hue,
      saturation,
      brightness
    })
  }

  isSelected = (hue, saturation, brightness) => {
    const { selection } = this.props

    if (!selection) {
      return false
    }

    return hue === selection.hue &&
      saturation === selection.saturation &&
      brightness === selection.brightness
  }

  render() {
    const { hue, brightness, onSelect, rowIndex } = this.props
    const gridSize = increments.length

    return (
      <Flex justifyContent='space-between'>
        {increments.map((saturation, index) => {
          const viewportPosition = index === 0 && rowIndex === 0 ? (
            'topLeftEdge'
          ) : rowIndex === gridSize - 1 && index === 0 ? (
            'bottomLeftEdge'
          ) : (
            'middle'
          )

          return (
            <HsbSwatch
              key={saturation}
              viewportIndex={index}
              viewportPosition={viewportPosition}
              selected={this.isSelected(hue, saturation, brightness)}
              hue={hue}
              saturation={saturation}
              brightness={brightness}
              onClick={this.handleSelect(hue, saturation, brightness)}
            />
          )
        })}
      </Flex>
    )
  }
}

export default HueRow