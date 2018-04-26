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

  handleHueChange = hue => {
    this.syncUrlWithHueSelection(hue)
    this.setState({ hue, copiedColorFormat: null })
  }

  syncUrlWithHueSelection = debounce(hue => {
    this.props.history.replace(`/${hue}`)
  }, 300)

  handleSwatchSelection = swatch => {
    const { selectedSwatch } = this.state
    const location =
      selectedSwatch && swatch.hex === selectedSwatch.hex
        ? `/${swatch.hue}`
        : `/${swatch.hue}/${swatch.saturation}/${swatch.brightness}`
    this.props.history.replace(location)
  }

  render() {
    const { match } = this.props
    const { copiedColorFormat, hue, selectedSwatch } = this.state
    const selectedSaturation = parseInt(match.params.saturation, 10) || null
    const selectedBrightness = parseInt(match.params.brightness, 10) || null
    const selectedHex =
      selectedSaturation && selectedBrightness
        ? hsb2Hex(hue, selectedSaturation, selectedBrightness).toUpperCase()
        : null

    return (
      <div
        className="app-container"
        style={{ backgroundColor: hsb2Hex(hue, 12, 88) }}
      >
        <div className="huebo">
          <div className="huebo-layout">
            <SwatchGrid
              hue={hue}
              selectedHex={selectedHex}
              onSelect={this.handleSwatchSelection}
            />
            <div className="hue-manager">
              <HueSelector hue={hue} onChange={this.handleHueChange} />
              <ColorOutputs
                hue={hue}
                hex={selectedHex}
                saturation={selectedSaturation}
                brightness={selectedBrightness}
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
