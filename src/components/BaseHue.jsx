import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'jsxstyle'
import Label from './Label'
import ColorProfile from './ColorProfile'

const BaseHue = ({ hue }) => (
  <Flex
    backgroundColor='#FFF'
    border='3px solid #DFDFDF'
    borderRadius={8}
    padding='6px 13px'
    alignItems='center'
    justifyContent='space-between'
  >
    <Label children='Base Hue' />
    <ColorProfile children={`${hue}°`} />
  </Flex>
)

export default BaseHue