import React from 'react'
import copy from 'copy-to-clipboard'
import { hsb2Hex } from '../utils/color_utils'
import ColorOutputs from './ColorOutputs'
import SwatchGrid from './SwatchGrid'
import HueSelector from './HueSelector'

export default class Huebo extends React.Component {
  state = {
    hue: 60,
    selectedSwatch: null,
    copiedColorFormat: null,
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

  handleHueChange = hue =>
    this.setState({ hue, selectedSwatch: null, copiedColorFormat: null })

  handleSwatchSelection = swatch => {
    this.setState(({ selectedSwatch }) => ({
      copiedColorFormat: null,
      selectedSwatch:
        selectedSwatch !== null && selectedSwatch.hex === swatch.hex
          ? null
          : swatch,
    }))
  }

  render() {
    const { copiedColorFormat, hue, selectedSwatch } = this.state

    return (
      <div
        className="app-container"
        style={{ backgroundColor: hsb2Hex(hue, 12, 88) }}
      >
        <div className="huebo">
          <div className="huebo-layout">
            <SwatchGrid
              hue={hue}
              selectedSwatch={selectedSwatch}
              onSelect={this.handleSwatchSelection}
            />
            <div className="hue-manager">
              <HueSelector hue={hue} onChange={this.handleHueChange} />
              <ColorOutputs
                {...selectedSwatch}
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
