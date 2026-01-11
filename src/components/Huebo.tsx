import { useDebouncedCallback } from '@tanstack/react-pacer';
import { useNavigate, useSearch } from '@tanstack/react-router';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { hsb2Hex } from '../utils/color_utils';
import ColorOutputs from './ColorOutputs';
import DocumentTitle from './DocumentTitle';
import HueSelector from './HueSelector';
import SwatchGrid from './SwatchGrid';

export default function Huebo() {
  const { b: brightness, h: hue, s: saturation } = useSearch({ from: '/' });
  const navigate = useNavigate();

  // Local state for instant UI feedback during slider drag
  const [displayHue = 60, setDisplayHue] = useState(hue);
  const [copiedColorFormat, setCopiedColorFormat] = useState<string | null>(
    null,
  );

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
      setCopiedColorFormat(null);
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

  const handleCopyColor = useCallback((value: string) => {
    copy(value);
    setCopiedColorFormat(value);
    setTimeout(() => setCopiedColorFormat(null), 2000);
  }, []);

  const documentTitle =
    brightness !== undefined && saturation !== undefined
      ? `HSB(${displayHue},${saturation},${brightness})`
      : `Hue: ${displayHue}`;

  const hex =
    saturation !== undefined && brightness !== undefined
      ? hsb2Hex(displayHue, saturation, brightness)
      : null;

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
                copiedColorFormat={copiedColorFormat}
                hex={hex}
                hue={displayHue}
                onCopy={handleCopyColor}
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
