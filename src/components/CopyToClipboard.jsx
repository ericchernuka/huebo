import React from 'react'
import PropTypes from 'prop-types'
import copy from 'copy-to-clipboard'

class CopyToClipboard extends React.Component {
  onClick = (e) => {
    const { onClick, text } = this.props
    const result = copy(text)

    if (onClick) {
      onClick(result)
    }
  }

  render() {
    const {
      text,
      onClick,
      children,
      ...rest
    } = this.props

    const elem = React.Children.only(children)

    return React.cloneElement(elem, {
      ...rest,
      onClick: this.onClick
    })
  }
}

export default CopyToClipboard