import React from 'react';
import Svg, { Path, G, Rect } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

interface Props {
  size?: number;
}

export const RocketFlightSvg: React.FC<Props> = ({
  width = 300,
  height = 400,
  color = '#FFFFFF',
}) => {
  return (
    <Svg width={width} height={height} viewBox='0 0 303 413' fill='none'>
      {/* Curved dashed flight trail */}
      <Path
        d='M 25 324 C 67 306, 111 277, 153 237 C 170 221, 184 207, 199 190'
        stroke={color}
        strokeWidth={3}
        strokeDasharray='12 15'
        strokeLinecap='round'
        opacity={0.72}
      />
      <G>
        {/* Main paper airplane */}
        <Path d='M 155 164 L 256 118 L 214 201 L 195 180 Z' fill={color} />

        {/* Upper wing highlight */}
        <Path
          d='M 155 164 L 256 118 L 195 180 Z'
          fill='#FFFFFF'
          opacity={0.96}
        />

        {/* Folded lower wing */}
        <Path
          d='M 195 180 L 214 201 L 256 118 Z'
          fill='#DCEBFF'
          opacity={0.9}
        />

        {/* Center fold */}
        <Path
          d='M 195 180 L 202 169 L 256 118'
          stroke='#B8D7FF'
          strokeWidth={1.4}
          opacity={0.85}
        />
      </G>
    </Svg>
  );
};

export default RocketFlightSvg;
