import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  width?: number;
  height?: number;
}

const JiraLogo = ({ width = 48, height = 48 }: Props) => {
  return (
    <Svg width={width} height={height} viewBox='0 0 24 24' fill='none'>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.5 11C2.5 6 7 2.5 12 2.5C17 2.5 21.5 6 21.5 11H2.5ZM12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5C13.5 8.32843 12.8284 9 12 9Z'
        fill='white'
      />
      <Path
        d='M1.5 14C1.5 14 6 19.5 12 19.5C18 19.5 22.5 14 22.5 14'
        stroke='white'
        strokeWidth={2.5}
        strokeLinecap='round'
      />
    </Svg>
  );
};

export default JiraLogo;
