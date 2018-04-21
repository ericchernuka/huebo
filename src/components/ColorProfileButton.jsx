import React from 'react'
import PropTypes from 'prop-types'
import copy from 'copy-to-clipboard'
import { callAll } from '../utils'

const ColorProfileButton = ({ onClick, placeholder, value }) => (
  <button
    type="button"
    onClick={() => callAll(onClick, copy)(value)}
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
