import {
  SliderHandle,
  SliderInput,
  SliderProps,
  SliderTrack,
} from '@reach/slider';
import '@reach/slider/styles.css';
import React from 'react';
import { HUE_STEP, MAX_HUE, MIN_HUE } from '../constants';

const HueSlider = (props: SliderProps) => {
  return (
    <SliderInput
      min={MIN_HUE}
      max={MAX_HUE}
      step={HUE_STEP}
      className="w-full px-0"
      {...props}
    >
      <SliderTrack className="bg-gray-300">
        <SliderHandle className="w-5 h-5 border border-gray-200 rounded-full shadow focus:border-blue-800 focus:shadow-outline" />
      </SliderTrack>
    </SliderInput>
  );
};

export default HueSlider;
