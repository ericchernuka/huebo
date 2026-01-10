import { useDebouncedState } from '@tanstack/react-pacer';
import { useNavigate, useParams } from '@tanstack/react-router';
import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { hsb2Hex } from '../utils/color_utils';
import ColorOutputs from './ColorOutputs';
import DocumentTitle from './DocumentTitle';
import HueSelector from './HueSelector';
import SwatchGrid from './SwatchGrid';

export default function Huebo() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();

  const hue = params.hue as number;
  const saturation = (params.saturation as number | undefined) ?? null;
  const brightness = (params.brightness as number | undefined) ?? null;

  // Local state for instant UI feedback during slider drag
  const [displayHue, setDisplayHue] = useState(hue);
  const [copiedColorFormat, setCopiedColorFormat] = useState<string | null>(
    null,
  );

  // Debounced navigation - commits to URL after 150ms of inactivity
  const [debouncedHue, setDebouncedHue] = useDebouncedState(hue, {
    wait: 150,
  });

  // Sync displayHue when URL changes externally (back/forward navigation)
  useEffect(() => {
    setDisplayHue(hue);
  }, [hue]);

  // Commit debounced hue to URL
  useEffect(() => {
    if (debouncedHue !== hue) {
      if (saturation !== null && brightness !== null) {
        navigate({
          params: {
            brightness,
            hue: debouncedHue,
            saturation,
          },
          to: '/$hue/$saturation/$brightness',
        });
      } else {
        navigate({ params: { hue: debouncedHue }, to: '/$hue' });
      }
    }
  }, [debouncedHue, hue, saturation, brightness, navigate]);

  const handleHueChange = useCallback(
    (newHue: number) => {
      setDisplayHue(newHue); // Instant UI update
      setDebouncedHue(newHue); // Schedule URL update
      setCopiedColorFormat(null);
    },
    [setDebouncedHue],
  );

  const handleSwatchClick = useCallback(
    (sat: number, bri: number) => {
      navigate({
        params: { brightness: bri, hue: displayHue, saturation: sat },
        to: '/$hue/$saturation/$brightness',
      });
    },
    [displayHue, navigate],
  );

  const handleCopyColor = useCallback((value: string) => {
    copy(value);
    setCopiedColorFormat(value);
    setTimeout(() => setCopiedColorFormat(null), 2000);
  }, []);

  const documentTitle =
    brightness !== null && saturation !== null
      ? `HSB(${displayHue},${saturation},${brightness})`
      : `Hue: ${displayHue}`;

  const hex =
    saturation !== null && brightness !== null
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
