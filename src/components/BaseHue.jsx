import React from 'react'
import PropTypes from 'prop-types'
import Label from './Label'

const BaseHue = ({ hue }) => (
  <div className="base-hue-wrapper">
    <Label>Base Hue</Label>
    <div className="color-profile">{`${hue}°`}</div>
  </div>
)

BaseHue.propTypes = {
  hue: PropTypes.number.isRequired,
}

export default BaseHue
