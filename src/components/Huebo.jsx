import React from 'react'
import debounce from 'lodash-es/debounce'
import copy from 'copy-to-clipboard'
import { hsb2Hex } from '../utils/color_utils'
import ColorOutputs from './ColorOutputs'
import SwatchGrid from './SwatchGrid'
import HueSelector from './HueSelector'

export default class Huebo extends React.Component {
  state = {
    hue: 60,
    copiedColorFormat: null,
  }

  /**
   * In order to keep the hue changes fluid and fast we need to keep the hue value
   * in state, but we also want to keep the URL in sync so if hue changes on the url, set it back
   * in state to keep the in lock-step.
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    const nextHue = parseInt(nextProps.match.params.hue, 10)

    if (nextHue !== prevState.hue) {
      return { hue: nextHue }
    }

    return null
  }

  handleCopy = format => {
    copy(format)
    this.setState(
      {
        copiedColorFormat: format,
      },
      () => {
        clearTimeout(this.timeout)

        this.timeout = setTimeout(() => {
          this.setState({ copiedColorFormat: null })
        }, 2000)
      },
    )
  }

  handleRangeFocus = value => {
    this.props.history.replace(`/${value}`)
  }

  handleHueChange = hue => {
    clearTimeout(this.clearFocus)
    this.setState(
      { hue, copiedColorFormat: null },
      this.syncUrlWithHueSelection,
    )
  }

  syncUrlWithHueSelection = debounce(
    () => this.props.history.replace(`/${this.state.hue}`),
    200,
  )

  parsedUrlParams = params =>
    Object.keys(params).reduce((acc, key) => {
      acc[key] = parseInt(params[key], 10) || null
      return acc
    }, {})

  render() {
    const { match } = this.props
    const { copiedColorFormat, hue } = this.state
    const { saturation, brightness } = this.parsedUrlParams(match.params)
    const hex =
      saturation && brightness ? hsb2Hex(hue, saturation, brightness) : null

    return (
      <div
        className="app-container"
        style={{ backgroundColor: hsb2Hex(hue, 12, 88) }}
      >
        <div className="huebo">
          <div className="huebo-layout">
            <SwatchGrid hue={hue} selectedHex={hex} />
            <div className="hue-manager">
              <HueSelector
                hue={hue}
                onChange={this.handleHueChange}
                onFocus={this.handleRangeFocus}
              />
              <ColorOutputs
                hue={hue}
                hex={hex}
                saturation={saturation}
                brightness={brightness}
                copiedColorFormat={copiedColorFormat}
                onCopy={this.handleCopy}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
