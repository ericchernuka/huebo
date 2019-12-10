import PropTypes from 'prop-types';
import React from 'react';

const BaseHue = ({ hue }) => (
  <div className="flex items-center justify-between px-3 py-1 border-2 border-gray-400 rounded">
    <h2 className="font-semibold text-gray-600">Base Hue</h2>
    <div
      className="text-3xl font-bold text-gray-800"
      data-testid="base-hue"
    >{`${hue}°`}</div>
  </div>
);

BaseHue.propTypes = {
  hue: PropTypes.number.isRequired,
};

export default BaseHue;
