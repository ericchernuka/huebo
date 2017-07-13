import React from 'react'
import PropTypes from 'prop-types'
import { Block } from 'jsxstyle'
import BaseHue from './BaseHue'

class HueSelector extends React.Component {
  render() {
    const { hue, onBlur, onChange } = this.props

    return (
      <Block>
        <BaseHue hue={hue} />
        <input
          type='range'
          min={0}
          max={360}
          step={5}
          style={{ width: '100%' }}
          onChange={onChange}
          onBlur={onBlur}
          value={hue}
        />
      </Block>
    )
  }
}

export default HueSelector