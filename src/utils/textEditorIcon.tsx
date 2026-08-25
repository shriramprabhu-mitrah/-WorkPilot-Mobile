import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface TextEditorIconProps {
  size?: number;
  color?: string;
}

export const TextEditorIcon: React.FC<TextEditorIconProps> = ({
  size = 24,
  color = '#666666',
}) => {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Path
        d='M4 6H14'
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap='round'
      />

      <Path
        d='M9 6V18'
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap='round'
      />

      <Path
        d='M6 18H12'
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap='round'
      />

      <Path
        d='M16 13L19 7L22 13'
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap='round'
        strokeLinejoin='round'
      />

      <Path
        d='M17 11H21'
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap='round'
      />
    </Svg>
  );
};
