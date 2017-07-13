import React from 'react'
import PropTypes from 'prop-types'
import { Block } from 'jsxstyle'

const ColorProfile = ({
  children,
  placeholder=false,
  ...props
}) => (
  <Block
    cursor='pointer'
    fontSize={32}
    fontWeight='bold'
    color={placeholder ? '#9E9E9E' : '#5E5E5E'}
    children={children}
    props={props}
  />
)

export default ColorProfile