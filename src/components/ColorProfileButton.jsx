import React from 'react'
import PropTypes from 'prop-types'

const ColorProfileButton = ({ onClick, placeholder = '–', value = null, ...props }) => (
  <button
    {...props}
    onClick={() => onClick(value)}
    type="button"
    disabled={!value}
    className={`color-profile ${!value ? 'color-profile-muted' : ''}`}
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
