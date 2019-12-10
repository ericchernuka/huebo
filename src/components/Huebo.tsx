import useParsedParams from 'hooks/use-parsed-params';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { buildHueIncrements } from 'utils';
import { hsb2Hex } from 'utils/color_utils';
import { MAX_HUE, MIN_HUE, HUE_STEP } from '../constants';
import ColorOutputs from './ColorOutputs';
import DocumentTitle from './DocumentTitle';
import SwatchLink from './SwatchLink';
import VisuallyHidden from './VisuallyHidden';
import HueSlider from './HueSlider';
import BaseHue from './BaseHue';

const Huebo = () => {
  const history = useHistory();
  const { hue: urlHue, brightness, saturation } = useParsedParams<{
    hue: number;
    saturation: number;
    brightness: number;
  }>({ hue: 'number', saturation: 'number', brightness: 'number' });

  const [dragHue, setDragHue] = useState<number>(urlHue);
  const [isDragging, setIsDragging] = useState(false);
  const hue = isDragging ? dragHue : urlHue;

  useEffect(() => {
    if (!isDragging) {
      history.push(
        `/${dragHue}${brightness ? `/${saturation}/${brightness}` : ''}`,
      );
    }
  }, [history, isDragging, dragHue, brightness, saturation]);

  const hex = useMemo(() => {
    if (!saturation || !brightness) {
      return null;
    }
    return hsb2Hex(hue, saturation, brightness);
  }, [saturation, brightness, hue]);

  const documentTitle = brightness
    ? `HSB(${urlHue},${saturation},${brightness})`
    : `Hue: ${urlHue}`;

  return (
    <DocumentTitle title={documentTitle}>
      <div
        className="flex h-screen md:items-center md:justify-center"
        style={{
          backgroundColor: hsb2Hex(urlHue, 12, 88),
          transition: 'background-color 500ms ease-in-out',
        }}
      >
        <div className="flex flex-col flex-col-reverse justify-between w-full m-4 rounded-lg shadow-md md:flex-row-reverse md:flex-row md:w-auto">
          <div className="relative flex-1 w-full p-8 overflow-y-auto bg-gray-100 rounded-b-lg md:rounded-r-lg md:rounded-l-none md:w-88">
            <div className="sticky top-0 w-full bg-gray-100 rounded-lg md:top-auto md:relative">
              <BaseHue hue={hue} />
              <HueSlider
                min={MIN_HUE}
                max={MAX_HUE}
                step={HUE_STEP}
                value={hue}
                onChange={value => setDragHue(value)}
                onKeyDown={() => setIsDragging(true)}
                onKeyUp={() => setIsDragging(false)}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                className="w-full px-0"
              />
            </div>

            <ColorOutputs
              hue={hue}
              hex={hex}
              saturation={saturation}
              brightness={brightness}
            />
          </div>
          <div className="flex flex-wrap flex-shrink-0 border-b-2 border-gray-300 md:border-0 h-80 md:h-96 md:w-88">
            {buildHueIncrements(hue).map(({ saturation, brightness, hex }) => {
              return (
                <SwatchLink
                  key={hex}
                  to={`/${hue}/${saturation}/${brightness}`}
                  returnTo={`/${hue}`}
                  hex={hex}
                >
                  <VisuallyHidden>{`Hue: ${hue}. Saturation: ${saturation}. Brightness: ${brightness}`}</VisuallyHidden>
                </SwatchLink>
              );
            })}
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
};

export default Huebo;
