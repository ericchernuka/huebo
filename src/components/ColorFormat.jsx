import React from 'react'
import PropTypes from 'prop-types'
import { Block } from 'jsxstyle'
import ColorProfile from './ColorProfile'
import CopyToClipboard from './CopyToClipboard'
import Label from './Label'

class ColorFormat extends React.Component {
  static defaultProps = {
    placeholder: '—'
  }

  render() {
    const { copied, label, value, onClick, placeholder } = this.props

    return (
      <Block marginTop={16}>
        <Label children={copied ? `${label} copied to clipboard` : label} />
        <Block>
          {
            value ? (
              <CopyToClipboard text={value} onClick={onClick}>
                <ColorProfile children={value} />
              </CopyToClipboard>
            ) : (
              <ColorProfile children={placeholder} placeholder />
            )
          }
        </Block>
      </Block>
    )
  }
}

export default ColorFormat