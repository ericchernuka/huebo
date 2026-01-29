import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { hsb2Hex } from '../utils/color-utils';
import { ColorOutputs } from './color-outputs';
import { DocumentTitle } from './document-title';
import { HueSelector } from './hue-selector';
import { SwatchGrid } from './swatch-grid';

export function Huebo() {
  const { b: brightness, h: hue, s: saturation } = useSearch({ from: '/' });
  const navigate = useNavigate();

  // Local state for instant UI feedback during slider drag
  const [displayHue = 60, setDisplayHue] = useState(hue);

  // Debounced navigation - commits to URL after 150ms of inactivity
  const commitURL = useDebouncedCallback(
    (hue: number) => {
      const search: { b?: number; h: number; s?: number } = { h: hue };
      if (saturation !== undefined) {
        search.s = saturation;
      }

      if (brightness !== undefined) {
        search.b = brightness;
      }

      navigate({ search, to: '/' });
    },
    {
      wait: 150,
    },
  );

  // Sync displayHue when URL changes externally (back/forward navigation)
  useEffect(() => {
    setDisplayHue(hue);
  }, [hue]);

  const handleHueChange = useCallback(
    (newHue: number) => {
      setDisplayHue(newHue); // Instant UI update
      commitURL(newHue); // Schedule URL update
    },
    [commitURL],
  );

  const handleSwatchClick = useCallback(
    (sat: number, bri: number) => {
      if (saturation === sat && brightness === bri) {
        // Deselect: clear saturation and brightness
        navigate({ search: { h: hue }, to: '/' });
        return;
      }

      navigate({
        search: { b: bri, h: hue, s: sat },
        to: '/',
      });
    },
    [brightness, hue, navigate, saturation],
  );

  const hasFullColor = saturation !== undefined && brightness !== undefined;
  const hex = hasFullColor ? hsb2Hex(displayHue, saturation, brightness) : null;
  const documentTitle = hasFullColor
    ? `HSB(${displayHue},${saturation},${brightness})`
    : `Hue: ${displayHue}`;

  return (
    <>
      <DocumentTitle title={documentTitle} />
      <div
        className="app-container"
        style={{ backgroundColor: hsb2Hex(displayHue, 12, 88) }}
      >
        <div className="huebo">
          <div className="huebo-layout">
            <div className="hue-manager">
              <HueSelector hue={displayHue} onChange={handleHueChange} />
              <ColorOutputs
                brightness={brightness}
                hue={displayHue}
                saturation={saturation}
              />
            </div>
            <SwatchGrid
              hue={displayHue}
              onSwatchClick={handleSwatchClick}
              selectedHex={hex}
            />
          </div>
        </div>
      </div>
    </>
  );
}
