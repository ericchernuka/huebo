import React from 'react'
import PropTypes from 'prop-types'
import { InlineBlock } from 'jsxstyle'
import { Motion, spring } from 'react-motion'
import { hslString } from '../utils/color'

const springConfig = {stiffness: 300, damping: 24};

class HsbSwatch extends React.Component {
  render() {
    const { hue, saturation, brightness, onClick, selected, viewportIndex, viewportPosition } = this.props

    const style = selected
      ? {
        scale: spring(1.1, springConfig),
        shadow: spring(16, springConfig),
      } : {
        scale: spring(1, springConfig),
        shadow: spring(1, springConfig),
      }

    return (
      <Motion style={style}>
        {({scale, shadow, y}) =>
          <InlineBlock
            component='button'
            height={50}
            width={50}
            cursor='pointer'
            borderStyle='none'
            borderTopLeftRadius={viewportPosition === 'topLeftEdge' ? 16 : undefined}
            borderBottomLeftRadius={viewportPosition === 'bottomLeftEdge' ? 16 : undefined}
            focusZIndex={1}
            props={{ onClick: onClick }}
            style={{
              boxShadow: selected ? `inset 0 0 0 3px #FFF, 0 4px ${shadow}px 0 rgba(0,0,0,0.25)` : undefined,
              transform: `translate3d(0, 0, 0) scale(${scale})`,
              WebkitTransform: `translate3d(0, 0, 0) scale(${scale})`,
              backgroundColor: hslString(hue, saturation, brightness),
              zIndex: selected ? 1 : undefined,
            }}
          />
        }
      </Motion>
    )
  }
}

export default HsbSwatch