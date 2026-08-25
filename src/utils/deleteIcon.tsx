import Svg, { Path } from 'react-native-svg';

export const DeleteIcon = ({
  size = 22,
  color = '#666666',
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <Path d='M4 7H20' stroke={color} strokeWidth={1.8} strokeLinecap='round' />

    <Path
      d='M10 11V17'
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap='round'
    />

    <Path
      d='M14 11V17'
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap='round'
    />

    <Path
      d='M6 7L7 20H17L18 7'
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
    />

    <Path
      d='M9 7V4H15V7'
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </Svg>
);
