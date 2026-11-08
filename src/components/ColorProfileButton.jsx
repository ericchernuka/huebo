import React from 'react'
import PropTypes from 'prop-types'

const ColorProfileButton = ({ onClick, placeholder = '–', value = null, ...props }) => (
  <button
    {...props}
    className={`color-profile ${!value ? 'color-profile-muted' : ''}`}
    disabled={!value}
    onClick={() => onClick(value)}
    type="button"
  >
    {value || placeholder}
  </button>
)

ColorProfileButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
}

export default ColorProfileButton
