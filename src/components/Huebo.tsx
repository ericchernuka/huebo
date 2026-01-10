import copy from 'copy-to-clipboard';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { extractHSBValuesFromParams } from '../utils';
import { hsb2Hex } from '../utils/color_utils';
import ColorOutputs from './ColorOutputs';
import DocumentTitle from './DocumentTitle';
import HueSelector from './HueSelector';
import SwatchGrid from './SwatchGrid';

interface Params {
  hue: string;
  saturation?: string;
  brightness?: string;
}

export default function Huebo() {
  const params = useParams<Params>();
  const navigate = useNavigate();

  const hue = Number(params.hue);
  const [draggingHue, setDraggingHue] = useState(hue);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedColorFormat, setCopiedColorFormat] = useState<string | null>(
    null,
  );

  const { saturation, brightness } = extractHSBValuesFromParams(params);

  // Sync draggingHue with URL hue when not dragging
  useEffect(() => {
    if (!isDragging) {
      setDraggingHue(hue);
    }
  }, [hue, isDragging]);

  const handleHueChange = useCallback((newHue: number) => {
    setDraggingHue(newHue);
    setIsDragging(true);
    setCopiedColorFormat(null);
  }, []);

  const handleHueChangeEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Sync URL when dragging ends
  useEffect(() => {
    if (!isDragging && draggingHue !== hue) {
      const urlPath =
        brightness !== null && saturation !== null
          ? `/${draggingHue}/${saturation}/${brightness}`
          : `/${draggingHue}`;
      navigate(urlPath);
    }
  }, [isDragging, draggingHue, hue, saturation, brightness, navigate]);

  const handleSwatchClick = useCallback(
    (sat: number, bri: number) => {
      navigate(`/${hue}/${sat}/${bri}`);
    },
    [hue, navigate],
  );

  const handleCopyColor = useCallback((value: string) => {
    copy(value);
    setCopiedColorFormat(value);
    setTimeout(() => setCopiedColorFormat(null), 2000);
  }, []);

  const displayHue = isDragging ? draggingHue : hue;

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
              <HueSelector
                hue={displayHue}
                onChange={handleHueChange}
                onChangeEnd={handleHueChangeEnd}
              />
              <ColorOutputs
                hue={displayHue}
                hex={hex}
                saturation={saturation}
                brightness={brightness}
                copiedColorFormat={copiedColorFormat}
                onCopy={handleCopyColor}
              />
            </div>
            <SwatchGrid
              hue={displayHue}
              selectedHex={hex}
              onSwatchClick={handleSwatchClick}
            />
          </div>
        </div>
      </div>
    </>
  );
}
