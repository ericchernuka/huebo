import React from 'react'
import PropTypes from 'prop-types'

const ColorProfileButton = ({ onClick, placeholder, value, ...props }) => (
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

ColorProfileButton.defaultProps = {
  placeholder: '–',
  value: null,
}

export default ColorProfileButton
