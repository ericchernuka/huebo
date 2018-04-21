import React from 'react'
import { hsb2Hex } from '../utils/color_utils'
import { buildHueIncrements } from '../utils'
import ColorOutputs from './ColorOutputs'
import HsbSwatch from './HsbSwatch'
import HueSelector from './HueSelector'

class App extends React.Component {
  state = {
    hue: 60,
    selectedSwatch: null,
    copiedColorFormat: null,
  }

  handleCopy = format => {
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

  handleHueChange = hue => this.setState({ hue, selectedSwatch: null, copiedColorFormat: null })

  handleSwatchSelection = swatch => {
    this.setState({
      copiedColorFormat: null,
      selectedSwatch: swatch,
    })
  }

  render() {
    const { copiedColorFormat, hue, selectedSwatch } = this.state

    return (
      <div className="app-container" style={{ backgroundColor: hsb2Hex(hue, 12, 88) }}>
        <div className="huebo">
          <div className="huebo-layout">
            <div className="hue-swatches">
              {buildHueIncrements(hue).map(swatch => (
                <HsbSwatch
                  key={swatch.hex}
                  swatch={swatch}
                  onClick={this.handleSwatchSelection}
                  selected={selectedSwatch && selectedSwatch.hex === swatch.hex}
                />
              ))}
            </div>
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

export default App
