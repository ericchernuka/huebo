import React from 'react'
import copy from 'copy-to-clipboard'
import { Redirect } from 'react-router-dom'
import { hsb2Hex } from '../utils/color_utils'
import { DEFAULT_HUE } from '../constants'
import ColorOutputs from './ColorOutputs'
import SwatchGrid from './SwatchGrid'
import HueSelector from './HueSelector'

export default class Huebo extends React.Component {
  state = {
    hue: DEFAULT_HUE,
    saturation: null,
    brightness: null,
    copiedColorFormat: null,
  }

  /**
   * In order to keep the hue changes fluid and fast we need to keep the hue value
   * in state, but we also want to keep the URL in sync so if hue changes on the url, set it back
   * in state to keep the in lock-step.
   */
  static getDerivedStateFromProps({ match: { params } }) {
    if (params.hue) {
      const selectedSwatch = Object.keys(params).reduce((acc, key) => {
        acc[key] = parseInt(params[key], 10) || null
        return acc
      }, {})

      if (!selectedSwatch.brightess) {
        return { hue: selectedSwatch.hue }
      }

      return { ...selectedSwatch }
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

  handleHueChange = hue => {
    this.setState({ hue, copiedColorFormat: null })
  }

  handleSwatchSelection = ({ hex, ...hsb }) => {
    this.setState(
      ({ hue, saturation, brightness }) =>
        hsb2Hex(hue, saturation, brightness) !== hex
          ? { ...hsb }
          : { hue, saturation: null, brightness: null },
    )
  }

  render() {
    const { match } = this.props

    if (match.params.hue) {
      return <Redirect to="/" />
    }

    const { copiedColorFormat, hue, saturation, brightness } = this.state
    const hex =
      saturation && brightness ? hsb2Hex(hue, saturation, brightness) : null

    return (
      <div
        className="app-container"
        style={{ backgroundColor: hsb2Hex(hue, 12, 88) }}
      >
        <div className="huebo">
          <div className="huebo-layout">
            <SwatchGrid
              hue={hue}
              selectedHex={hex}
              onSelect={this.handleSwatchSelection}
            />
            <div className="hue-manager">
              <HueSelector hue={hue} onChange={this.handleHueChange} />
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
