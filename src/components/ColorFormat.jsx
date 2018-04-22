import React from 'react'
import PropTypes from 'prop-types'
import Label from './Label'

const ColorFormat = ({ children, copied, label, ...props }) => (
  <div className="color-format-block" {...props}>
    <Label>{copied ? `${label} copied to clipboard` : label}</Label>
    {children}
  </div>
)

ColorFormat.propTypes = {
  copied: PropTypes.bool,
  label: PropTypes.string.isRequired,
}

ColorFormat.defaultProps = {
  copied: false,
}

export default ColorFormat
