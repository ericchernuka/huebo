import React from 'react'
import PropTypes from 'prop-types'
import { Block } from 'jsxstyle'

const Label = ({ children }) => (
  <Block
    component='h2'
    color='#ABABAB'
    fontSize={16}
    fontWeight='bold'
    children={children}
  />
)

export default Label