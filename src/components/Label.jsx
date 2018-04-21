import React from 'react'
import PropTypes from 'prop-types'

const Label = ({ children, ...props }) => <h2 {...props}>{children}</h2>

Label.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]).isRequired,
}

export default Label
